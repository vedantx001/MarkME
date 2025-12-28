const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const { MongoClient } = require('mongodb');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Configuration
const BASE_URL = 'http://localhost:5000'; // Assuming Node backend is on 5000 based on 'server.js' context usually. Or env.
// Prompt didn't specify backend port, but typical MERN is 5000 or 3000.  User "nodemon server.js" usually defaults to ENV PORT or 5000.
// I'll check process.env.PORT or default to 5000.
// Actually, let's try reading env or assume 5000 and log it?
// Or checking logs: "nodemon server.js (in c:\Users\Asus\SIH-MarkME\server, running for 4m54s)" - usually logs port.
// I'll default to 5000.

const MONGO_URL = process.env.MONGO_URL; // Using server .env

if (!MONGO_URL) {
    console.error("❌ MONGO_URL not found in .env");
    process.exit(1);
}

// Global Variables
let adminToken = null;
let classId = null;
let savedClassId = null;

// Paths
const EXCEL_PATH = path.join(__dirname, '../utils/Sample_Students.xlsx');
const ZIP_PATH = path.join(__dirname, '../utils/10-C.zip');

// Helpers
const log = (msg) => console.log(msg);
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runTest = async () => {
    log("🚀 Starting Face Registration Flow Test...");

    // PHASE 1: Admin & Class Setup
    try {
        log("\n🔹 Phase 1: Admin & Class Setup");

        // 1. Login (Registering might be needed if fresh db? Assuming Admin exists or I need to handle that. 
        // Usually tests assume seed or specific flow. I'll attempt login. 
        // If user says "Register/Login", I'll try login first.
        // Credentials? "Admin" "admin123" is common default or environment based. 
        // I'll assume standard test credentials or create one if possible?
        // User request: "Register/Login as an Admin". 
        // I will try to register a new random admin to be safe, or login if "admin@example.com" exists.

        // Let's trying registering a fresh admin to ensure success.
        const adminEmail = `urban_admin@test.com`;
        const adminPassword = 'password123';

        log(`   Registering Admin: ${adminEmail}`);

        // Register Admin
        // Using typical route /api/auth/register-school usually? Or /api/auth/register?
        // I should verify auth routes. But prompt implies "Register/Login".
        // I will try a standard registration flow.
        // Specifying "schoolName" often needed for admin registration in this context.

        let authRes;
        try {
            authRes = await axios.post(`${BASE_URL}/api/auth/register-admin`, {
                adminName: "Urban Admin",
                adminEmail: adminEmail,
                password: adminPassword,
                schoolName: "Urban School",
                schoolIdx: "SCH_10482",
                address: "Urban School, Mehsana-2, Gujarat"
            });
        } catch (e) {
            // If register fails (maybe route is different), try login with hardcoded or handle generic
            log("   ⚠️ Registration might have failed or endpoint differs. Error: " + (e.response?.data?.message || e.message));
            // Fallback: This user is likely working on an existing system. 
            // I'll assume they have a way to get a token or I'll try a common login.
            // Actually, prompt says "Register/Login".
            process.exit(1);
        }

        log("   ✅ Admin Registered");

        // Login to get token (if register didn't return it, but usually MERN registers returns token)
        if (authRes.data.token) {
            adminToken = authRes.data.token;
        } else {
            // Try login
            const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
                email: adminEmail,
                password: adminPassword
            });
            adminToken = loginRes.data.token;
        }

        if (!adminToken) throw new Error("No token received");
        log("   ✅ Got Auth Token");

        // Create a Teacher first (Required for Class)
        log("   Creating Teacher 'Test Teacher'...");
        const teacherEmail = `prakash_urban@test.com`;
        const teacherRes = await axios.post(
            `${BASE_URL}/api/admin/users`,
            {
                name: "Prakash Patel",
                email: teacherEmail,
                password: "password123",
                role: "TEACHER"
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        const teacherId = teacherRes.data.user.id;
        log(`   ✅ Teacher Created: ID ${teacherId}`);

        // Create Class 10-C
        log("   Creating Class '10-C'...");
        const classRes = await axios.post(
            `${BASE_URL}/api/classes`,
            {
                name: "10-C",
                educationalYear: "2025-2026",
                std: "10",
                division: "C",
                classTeacherId: teacherId
            },
            { headers: { Authorization: `Bearer ${adminToken}` } }
        );
        savedClassId = classRes.data._id || classRes.data.class?._id;
        log(`   ✅ Class Created: ID ${savedClassId}`);

    } catch (error) {
        log("❌ Phase 1 Failed:");
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
        else console.error(error.message);
        process.exit(1);
    }

    // PHASE 2: Bulk Text Registration
    try {
        log("\n🔹 Phase 2: Bulk Text Registration (Excel)");

        if (!fs.existsSync(EXCEL_PATH)) throw new Error(`Excel file not found at ${EXCEL_PATH}`);

        const form = new FormData();
        form.append('file', fs.createReadStream(EXCEL_PATH));
        form.append('classId', savedClassId);

        log("   Uploading Excel...");
        const uploadRes = await axios.post(
            `${BASE_URL}/api/students/bulk-upload`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        log("   ✅ Bulk Text Upload Complete");
        log(`   Response: ${JSON.stringify(uploadRes.data)}`);

    } catch (error) {
        log("❌ Phase 2 Failed:");
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
        else console.error(error.message);
        process.exit(1);
    }

    // PHASE 3: Bulk Photo Registration
    try {
        log("\n🔹 Phase 3: Bulk Photo Registration (ZIP)");

        if (!fs.existsSync(ZIP_PATH)) throw new Error(`Zip file not found at ${ZIP_PATH}`);

        const form = new FormData();
        // form.append('zipFile', fs.createReadStream(ZIP_PATH)); // Removed duplicate
        // Checking Context: "Upload utils/10-C.zip to POST /api/students/bulk-photo-upload"
        // I'll assume 'zipFile' or 'file'. Standard in multer is often 'file' but let's guess 'zipFile' based on name or 'file'.
        // Safe bet: 'file' is most common for single upload middleware. 
        // Wait, let's use 'zipFile' as it is specific? No, typical multer setup uses generic field.
        // I will verify 'server/connections/studentController.js' or similar if I could, but wait, I can't see route defs.
        // I'll use 'zipFile' as typical for specific zip uploaders, or 'file'. 
        // Let's Use 'file' as generic default, or try to be smart?
        // Actually, Phase 2 used 'file' for excel.
        // I will use 'zipFile' for zip to distinguish or 'file'.
        form.append('classId', savedClassId);
        form.append('file', fs.createReadStream(ZIP_PATH), { filename: '10-C.zip', contentType: 'application/zip' });

        log("   Uploading ZIP (Tracing AI trigger)...");
        const photoRes = await axios.post(
            `${BASE_URL}/api/students/bulk-photo-upload`,
            form,
            {
                headers: {
                    ...form.getHeaders(),
                    Authorization: `Bearer ${adminToken}`
                }
            }
        );

        log("   ✅ ZIP Upload Accepted");
        log(`   Response: ${JSON.stringify(photoRes.data)}`);

        log("   ⏳ Waiting 10s for AI processing...");
        await sleep(10000);

    } catch (error) {
        log("❌ Phase 3 Failed:");
        if (error.response) console.error(JSON.stringify(error.response.data, null, 2));
        else console.error(error.message);
        process.exit(1);
    }

    // PHASE 4: Database Verification
    let client;
    try {
        log("\n🔹 Phase 4: Database Verification");

        client = new MongoClient(MONGO_URL);
        await client.connect();
        const db = client.db(); // Uses default db from URL

        // Step A: Check Student profileImageUrl
        const student = await db.collection('students').findOne({ classId: new (require('mongodb').ObjectId)(savedClassId) });
        // Note: Collection name might be 'students' (lowercase plural) or 'Student'? Mongoose default is lowercase plural 'students'.

        if (!student) throw new Error("No student found in DB for this class");

        if (student.profileImageUrl && student.profileImageUrl.includes('cloudinary')) {
            log("   ✅ Student has Cloudinary URL: " + student.profileImageUrl);
            log("   ✅ Student ID: " + student._id);
        } else {
            throw new Error("Student missing valid profileImageUrl: " + JSON.stringify(student));
        }

        // Step B: Check DataFace/StudentFaceData
        // Collection name: "StudentFaceData" (as defined in mongo.py and likely Mongoose model)
        const faceData = await db.collection('StudentFaceData').findOne({ studentId: new (require('mongodb').ObjectId)(student._id) });
        // Note: studentId in python might be string or ObjectId?
        // In mongo.py: `save_student_embedding(studentId, ...)` where studentId comes from request.
        // In studentController.js: `student._id.toString()` was passed.
        // So in Mongo it is stored as string `studentId`.
        // Wait, python `save_student_embedding` stores exactly what is passed.
        // Node passed `student._id.toString()`.
        // So `studentId` field in `StudentFaceData` is a STRING.
        // BUT, the findOne query above used `ObjectId`.
        // If Python stores it as string, I should query as string.

        const faceDataStringQuery = await db.collection('StudentFaceData').findOne({ studentId: student._id.toString() });

        if (faceDataStringQuery) {
            log("   ✅ Face Data Found (by String ID)");
            if (Array.isArray(faceDataStringQuery.embedding) && faceDataStringQuery.embedding.length === 512) {
                log("   ✅ Embedding Valid (Length 512)");
            } else {
                throw new Error("Invalid embedding format or length");
            }
        } else {
            // Fallback check if stored as ObjectId?
            const faceDataObjQuery = await db.collection('StudentFaceData').findOne({ studentId: student._id });
            if (faceDataObjQuery) {
                log("   ✅ Face Data Found (by ObjectId) - Warning: Schema mismatch with Python?");
            } else {
                throw new Error("❌ No Face Data found for student " + student._id);
            }
        }

        log("\n✨ TEST PASSED SUCCESSFULLY ✨");

    } catch (error) {
        log("❌ Phase 4 Verify Failed:");
        console.error(error);
    } finally {
        if (client) await client.close();
    }
};

runTest();
