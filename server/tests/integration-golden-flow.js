const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const TIMESTAMP = Date.now();

// Test Data
// Prerequisite: Random string to avoid "User already exists" (and other unique constraints)
const adminData = {
    schoolIdx: `SCH-${TIMESTAMP}`,
    schoolName: `Test School ${TIMESTAMP}`,
    address: '123 Test Lane',
    adminName: 'Super Admin',
    adminEmail: `admin_${TIMESTAMP}@school.com`,
    password: 'password123'
};

const teacherData = {
    name: 'John Teacher',
    email: `teacher_${TIMESTAMP}@school.com`,
    password: 'password123',
    role: 'TEACHER'
};

const classData = {
    educationalYear: '2024',
    std: '10',
    division: `A-${TIMESTAMP}`, // Randomize division to ensure Class uniqueness if school/year/std are same
    name: '10-A Test Class'
};

const studentData = {
    name: 'Alice Student',
    rollNumber: TIMESTAMP % 10000,
    dob: '2010-01-01',
    gender: 'F'
};

// State
let ADMIN_TOKEN = '';
let TEACHER_TOKEN = '';
let TEACHER_ID = ''; // Needed for class creation if logic requires it
let CLASS_ID = '';
let SESSION_ID = '';

const TEMP_IMAGE_PATH = path.join(__dirname, 'test-image.jpg');

const log = (msg) => console.log(msg);
const fail = (step, error) => {
    console.error(`❌ ${step} Failed!`);
    if (error.response) {
        console.error('Status:', error.response.status);
        console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
        console.error(error.message);
    }
    // Try to cleanup even on fail
    if (fs.existsSync(TEMP_IMAGE_PATH)) fs.unlinkSync(TEMP_IMAGE_PATH);
    process.exit(1);
};

async function run() {
    console.log('🚀 Starting Master Integration Test (Golden Flow)...\n');

    // 1. Register Admin & Login
    try {
        log(`⏳ Step 1: Registering Admin (${adminData.adminEmail})...`);
        const regRes = await axios.post(`${BASE_URL}/auth/register-admin`, adminData);
        // Login
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: adminData.adminEmail,
            password: adminData.password
        });
        ADMIN_TOKEN = loginRes.data.token;
        log(`✅ Step 1: Admin Registered & Logged In`);
    } catch (e) { fail('Step 1', e); }

    // 2. Create Teacher
    try {
        log(`⏳ Step 2: Creating Teacher User...`);
        // Note: adminController.createUser payload: { name, email, password, role }
        const res = await axios.post(`${BASE_URL}/admin/users`, teacherData, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        TEACHER_ID = res.data.user.id;
        log(`✅ Step 2: Teacher Created (ID: ${TEACHER_ID})`);
    } catch (e) { fail('Step 2', e); }

    // 3. Create Class
    try {
        log(`⏳ Step 3: Creating Class...`);
        // Payload: { educationalYear, std, division, classTeacherId, name }
        const payload = { ...classData, classTeacherId: TEACHER_ID };
        const res = await axios.post(`${BASE_URL}/classes`, payload, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        CLASS_ID = res.data._id;
        log(`✅ Step 3: Class Created (ID: ${CLASS_ID})`);
    } catch (e) { fail('Step 3', e); }

    // 4. Add Student
    try {
        log(`⏳ Step 4: Adding Student to Class...`);
        // Payload: { classId, name, rollNumber, dob, gender }
        const payload = { ...studentData, classId: CLASS_ID };
        const res = await axios.post(`${BASE_URL}/students`, payload, {
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        });
        log(`✅ Step 4: Student Added (ID: ${res.data._id})`);
    } catch (e) { fail('Step 4', e); }

    // 5. Login Teacher
    try {
        log(`⏳ Step 5: Logging in as Teacher...`);
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: teacherData.email,
            password: teacherData.password
        });
        TEACHER_TOKEN = res.data.token;
        log(`✅ Step 5: Teacher Logged In`);
    } catch (e) { fail('Step 5', e); }

    // 6. Start Session
    try {
        log(`⏳ Step 6: Starting Session...`);
        // Payload: { classId, date, teacherId? }
        const payload = {
            classId: CLASS_ID,
            date: '2025-01-01',
            teacherId: TEACHER_ID
        };
        const res = await axios.post(`${BASE_URL}/attendance-sessions`, payload, {
            headers: { Authorization: `Bearer ${TEACHER_TOKEN}` }
        });
        SESSION_ID = res.data._id;
        log(`✅ Step 6: Session Created/Fetched (ID: ${SESSION_ID})`);
    } catch (e) { fail('Step 6', e); }

    // 7. Upload Image
    try {
        log(`⏳ Step 7: Creating dummy image and Uploading...`);

        // Create dummy file
        fs.writeFileSync(TEMP_IMAGE_PATH, 'dummy image content');

        const form = new FormData();
        form.append('images', fs.createReadStream(TEMP_IMAGE_PATH), 'test-image.jpg');

        // Route: POST /api/classroom-images/:sessionId/images
        const res = await axios.post(`${BASE_URL}/classroom-images/${SESSION_ID}/images`, form, {
            headers: {
                Authorization: `Bearer ${TEACHER_TOKEN}`,
                ...form.getHeaders()
            }
        });
        log(`✅ Step 7: Image Uploaded. Status: ${res.status}`);
    } catch (e) { fail('Step 7', e); }

    // 8. Verify Records
    try {
        log(`⏳ Step 8: Verifying Records...`);
        // Route: GET /api/attendance-sessions/:sessionId
        // Verify records array exists
        const res = await axios.get(`${BASE_URL}/attendance-sessions/${SESSION_ID}`, {
            headers: { Authorization: `Bearer ${TEACHER_TOKEN}` }
        });

        const records = res.data.records;
        if (!Array.isArray(records)) {
            throw new Error('Response does not contain "records" array');
        }

        log(`✅ Step 8: Verified ${records.length} records found in session.`);

        // Cleanup
        if (fs.existsSync(TEMP_IMAGE_PATH)) {
            fs.unlinkSync(TEMP_IMAGE_PATH);
            log(`🧹 Cleanup: Dummy image deleted.`);
        }

        console.log('\n✨ MASTER INTEGRATION TEST PASSED! ✨');
    } catch (e) { fail('Step 8', e); }

}

run();
