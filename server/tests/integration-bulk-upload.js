const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

const BASE_URL = 'http://localhost:5000/api';
const SAMPLE_EXCEL_PATH = path.join(__dirname, '../utils/Sample_Students.xlsx');

// Helpers
const logStep = (step, msg) => console.log(`✅ Step ${step}: ${msg}`);
const logInfo = (msg) => console.log(`   ℹ️  ${msg}`);

async function runTest() {
    console.log('🚀 Starting Bulk Upload Integration Test...\n');

    // Variables to hold state across steps
    let adminToken = '';
    let schoolId = '';
    let teacherId = '';
    let classId = '';

    // Unique data generators
    const timestamp = Date.now();
    const adminEmail = `admin_bulk_${timestamp}@school.com`;
    const teacherEmail = `teacher_bulk_${timestamp}@school.com`;

    try {
        if (!fs.existsSync(SAMPLE_EXCEL_PATH)) {
            throw new Error(`Sample Excel file not found at: ${SAMPLE_EXCEL_PATH}`);
        }

        // =================================================================
        // STEP 1: Auth & Admin - Register Admin
        // =================================================================
        console.log(`🔹 Registering Admin...`);

        await axios.post(`${BASE_URL}/auth/register-admin`, {
            adminName: 'Super Admin',
            adminEmail: adminEmail,
            password: 'password123',
            schoolIdx: `SCH_BULK_${timestamp}`,
            schoolName: 'Bulk Test School'
        });

        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
            email: adminEmail,
            password: 'password123'
        });

        adminToken = loginRes.data.token;
        schoolId = loginRes.data.user?.schoolId;

        logStep(1, 'Admin Registered & Logged In');


        // =================================================================
        // STEP 2: User Mgmt - Create Teacher
        // =================================================================
        const adminAuthHeaders = { headers: { Authorization: `Bearer ${adminToken}` } };

        const createTeacherRes = await axios.post(`${BASE_URL}/admin/users`, {
            name: 'Bulk Teacher',
            email: teacherEmail,
            password: 'password123',
            role: 'TEACHER',
            schoolId: schoolId
        }, adminAuthHeaders);

        teacherId = createTeacherRes.data.user?.id || createTeacherRes.data.user?._id;
        logStep(2, 'Teacher Created');


        // =================================================================
        // STEP 3: Class Mgmt - Create Class
        // =================================================================
        const createClassRes = await axios.post(`${BASE_URL}/classes`, {
            educationalYear: '2025',
            std: '11',
            division: `B_${timestamp}`,
            classTeacherId: teacherId,
            name: `Class 11-B ${timestamp}`
        }, adminAuthHeaders);

        classId = createClassRes.data._id || createClassRes.data.id;
        logStep(3, 'Class Created');


        // =================================================================
        // STEP 4: Bulk Upload Students
        // =================================================================
        console.log(`🔹 Uploading ${SAMPLE_EXCEL_PATH}...`);

        const form = new FormData();
        // Append text fields first (good practice with some multer versions/configs)
        form.append('classId', classId);
        form.append('file', fs.createReadStream(SAMPLE_EXCEL_PATH));

        const uploadHeaders = {
            headers: {
                Authorization: `Bearer ${adminToken}`, // Admin can upload too, or use teacher
                ...form.getHeaders()
            }
        };

        const uploadRes = await axios.post(`${BASE_URL}/students/bulk-upload`, form, uploadHeaders);

        logStep(4, 'Bulk Upload Request Sent');
        logInfo(`Response: ${JSON.stringify(uploadRes.data, null, 2)}`);

        if (uploadRes.data.uploaded > 0) {
            logStep(4.1, `Successfully uploaded ${uploadRes.data.uploaded} students.`);
        } else {
            console.warn('⚠️ No students uploaded. Check Excel content or validation errors.');
        }

        // =================================================================
        // STEP 5: Verify Students in DB
        // =================================================================
        const studentsRes = await axios.get(`${BASE_URL}/students?classId=${classId}`, adminAuthHeaders);
        const students = studentsRes.data;

        logStep(5, `Fetched ${students.length} students from class.`);

        if (students.length !== uploadRes.data.uploaded) {
            console.warn(`⚠️ Count mismatch! Uploaded says ${uploadRes.data.uploaded}, but fetched ${students.length}.`);
        } else {
            logStep(5.1, 'Count matches!');
        }

        console.log('\n✨✨ BULK UPLOAD TEST COMPLETED! ✨✨');

    } catch (error) {
        console.error('\n❌ TEST FAILED ❌');
        if (error.response) {
            console.error(`Status: ${error.response.status}`);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
            console.error(error.stack);
        }
        process.exit(1);
    }
}

runTest();
