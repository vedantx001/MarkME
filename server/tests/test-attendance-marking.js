const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
const BASE_URL = 'http://localhost:5000';
const MONGO_URL = process.env.MONGO_URL;

// YOUR SPECIFIC IDS
const IDS = {
    admin: "694cde086e09539448e62986",
    teacher: "694cde096e09539448e6298f",
    school: "694cde086e09539448e62984",
    class: "694cde096e09539448e62993"
};

if (!MONGO_URL) {
    console.error("❌ MONGO_URL not found in .env");
    process.exit(1);
}

// Path to your test image
// const IMAGE_PATH = path.join(__dirname, '../utils/classroom-test-1.jpg');

const log = (msg) => console.log(msg);

const runTest = async () => {
    const startTime = Date.now();
    log("🚀 Starting Attendance Marking Test with Fixed IDs...");
    let client;

    // Dynamic Image Discovery
    const utilsDir = path.join(__dirname, '../utils');
    let IMAGE_FILENAMES = [];
    try {
        const files = fs.readdirSync(utilsDir);
        IMAGE_FILENAMES = files.filter(file =>
            file.startsWith('class-image-') &&
            (file.endsWith('.jpg') || file.endsWith('.jpeg') || file.endsWith('.png'))
        ).sort();
    } catch (err) {
        console.error("Error reading utils directory:", err);
    }

    log(`   Found ${IMAGE_FILENAMES.length} test images: ${IMAGE_FILENAMES.join(', ')}`);

    try {
        // Connect to DB
        client = new MongoClient(MONGO_URL);
        await client.connect();
        const db = client.db();

        // ---------------------------------------------------------
        // PHASE 0: Cleanup (Ensure Fresh State)
        // ---------------------------------------------------------
        log("\n🔹 Phase 0: Cleaning up previous test data...");
        const cleanupDate = new Date();
        cleanupDate.setHours(0, 0, 0, 0);

        const existingSession = await db.collection('attendancesessions').findOne({
            classId: new ObjectId(IDS.class),
            date: cleanupDate
        });

        if (existingSession) {
            await db.collection('attendancesessions').deleteOne({ _id: existingSession._id });
            const deleteResult = await db.collection('attendancerecords').deleteMany({ sessionId: existingSession._id });
            log(`   ✅ Deleted existing session ${existingSession._id} and ${deleteResult.deletedCount} records.`);
        } else {
            log("   ✅ No existing session for today. Clean start.");
        }

        // ---------------------------------------------------------
        // PHASE 1: Login & Token Retrieval
        // ---------------------------------------------------------
        log("\n🔹 Phase 1: Authentication");

        // Note: Using the Admin ID to find the correct email for login
        const adminUser = await db.collection('users').findOne({ _id: new ObjectId(IDS.admin) });
        if (!adminUser) throw new Error("Provided Admin ID does not exist in the database.");

        log(`   Authenticating as: ${adminUser.email}`);

        // Log in using your existing admin credentials (assuming the same password used previously)
        let token;
        try {
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: adminUser.email,
                password: 'password123' // Use the password you set during registration
            });
            token = loginRes.data.token;
            log("   ✅ Auth Token obtained");
        } catch (e) {
            throw new Error("Login failed. Ensure the server is running and password matches.");
        }

        // ---------------------------------------------------------
        // PHASE 2: Trigger Attendance Marking (Parallel for multiple images)
        // ---------------------------------------------------------
        log("\n🔹 Phase 2: Processing Classroom Images (POST /process)");

        // Filter invalid files first
        const validFiles = IMAGE_FILENAMES.filter(filename => {
            const currentImagePath = path.join(__dirname, '../utils', filename);
            if (!fs.existsSync(currentImagePath)) {
                log(`   ⚠️ Image not found, skipping: ${filename}`);
                return false;
            }
            return true;
        });

        if (validFiles.length === 0) {
            throw new Error("No valid images found to process.");
        }

        // Process all valid images in parallel
        const uploadPromises = validFiles.map(async (filename) => {
            log(`   🚀 Starting Upload: ${filename}`);
            const currentImagePath = path.join(__dirname, '../utils', filename);

            const form = new FormData();
            form.append('classId', IDS.class);
            form.append('classroomImage', fs.createReadStream(currentImagePath));

            try {
                const processRes = await axios.post(
                    `${BASE_URL}/api/attendance-sessions/process`,
                    form,
                    {
                        headers: {
                            ...form.getHeaders(),
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                log(`   ✅ Finished: ${filename}`);
                // Return success result
                return { success: true, filename, data: processRes.data };
            } catch (err) {
                log(`   ❌ Failed: ${filename}`);
                const errMsg = err.response ? JSON.stringify(err.response.data) : err.message;
                return { success: false, filename, error: errMsg };
            }
        });

        const results = await Promise.all(uploadPromises);

        // Summarize results
        let processedCount = 0;
        results.forEach(res => {
            if (res.success) {
                processedCount++;
                console.log(`\n   📄 Summary for ${res.filename}:`, {
                    present: res.data.present,
                    absent: res.data.absent,
                    total: res.data.total
                });
            } else {
                console.error(`\n   ❌ Error for ${res.filename}: ${res.error}`);
            }
        });

        log(`\n   ✅ Successfully processed ${processedCount}/${results.length} images.`);

        if (processedCount === 0) {
            throw new Error("No images were successfully processed.");
        }

        // ---------------------------------------------------------
        // PHASE 3: Database Verification
        // ---------------------------------------------------------
        log("\n🔹 Phase 3: Verifying MongoDB Collections");

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // 1. Check for Attendance Session
        const session = await db.collection('attendancesessions').findOne({
            classId: new ObjectId(IDS.class),
            date: today
        });

        if (!session) {
            log("   ⚠️ Strict date match failed. Searching for most recent session for this class...");
            const lastSession = await db.collection('attendancesessions').findOne(
                { classId: new ObjectId(IDS.class) },
                { sort: { _id: -1 } }
            );
            if (!lastSession) throw new Error("No session found at all for this class.");
            log(`   ✅ Using Latest Session Found: ${lastSession._id}`);
        } else {
            log(`   ✅ Found Session for Today: ${session._id}`);
        }

        const sessionId = session ? session._id : (await db.collection('attendancesessions').findOne({ classId: new ObjectId(IDS.class) }, { sort: { _id: -1 } }))._id;

        // 2. Check Attendance Records for this session
        const records = await db.collection('attendancerecords').find({
            sessionId: sessionId
        }).toArray();

        log(`   Total records in DB for this session: ${records.length}`);

        const presentStudents = records.filter(r => r.status === 'P');
        log(`   Students marked 'Present' in DB: ${presentStudents.length}`);

        const absentStudents = records.filter(r => r.status === 'A');
        log(`   Students marked 'Absent' in DB: ${absentStudents.length}`);

        if (presentStudents.length > 0) {
            const studentIds = presentStudents.map(r => r.studentId);
            const studentDetails = await db.collection('students').find({
                _id: { $in: studentIds }
            }).toArray();

            log("\n📋 LIST OF PRESENT STUDENTS:");
            studentDetails.forEach(s => log(`   - ${s.name} (Roll: ${s.rollNumber})`));
            log("\n✅ Attendance Marking Test: PASSED");
        } else {
            log("\n❌ Attendance Marking Test: FAILED (No students recognized)");
        }

    } catch (error) {
        log("\n❌ TEST FAILED:");
        if (error.response) {
            console.error(JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    } finally {
        if (client) await client.close();
        const endTime = Date.now();
        const duration = (endTime - startTime) / 1000;
        log(`\n⏳ Execution Time: ${duration.toFixed(2)} seconds`);
    }
};

runTest();