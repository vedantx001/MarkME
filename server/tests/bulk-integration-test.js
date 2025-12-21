const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Configuration
const BASE_URL = 'http://localhost:5000/api';
const UNIQUE_ID = Date.now();
const ADMIN_EMAIL = `admin_bulk_${UNIQUE_ID}@test.com`;
const ADMIN_PASSWORD = 'password123';
const SCHOOL_NAME = 'BulkTestSchool';
const CLASS_NAME = '6-B';

// Paths to test files
const EXCEL_FILE_PATH = path.join(__dirname, '../utils/Sample_Students.xlsx');
const ZIP_FILE_PATH = path.join(__dirname, '../utils/6-B.zip');

let adminToken = null;
let classId = null;

const runTest = async () => {
    console.log('🚀 Starting Bulk Upload Integration Test');
    console.log(`target: ${BASE_URL}`);
    console.log(`admin: ${ADMIN_EMAIL}`);

    try {
        // ==========================================
        // STEP 1: AUTHENTICATION
        // ==========================================
        console.log('\n------------------------------------------------');
        console.log('Step 1: Admin Registration & Login');
        try {
            await axios.post(`${BASE_URL}/auth/register-admin`, {
                schoolIdx: `SCH_${UNIQUE_ID}`,
                schoolName: SCHOOL_NAME,
                address: '123 Test St',
                adminName: 'Bulk Admin',
                adminEmail: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });

            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });

            adminToken = loginRes.data.token;
            console.log('✅ Admin registered and logged in successfully.');
        } catch (error) {
            console.error('❌ Auth failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
            process.exit(1);
        }

        const authHeaders = {
            headers: { Authorization: `Bearer ${adminToken}` }
        };

        // ==========================================
        // STEP 2: CLASS CREATION
        // ==========================================
        console.log('\n------------------------------------------------');
        console.log('Step 2: Create Class 6-B');
        try {
            // 2a. Create Teacher first
            const teacherEmail = `teacher_${UNIQUE_ID}@test.com`;
            await axios.post(`${BASE_URL}/admin/users`, {
                name: "Test Teacher",
                email: teacherEmail,
                password: "password123",
                role: "TEACHER"
            }, authHeaders);

            // 2b. Get that teacher ID
            // FIX: listUsers returns { success: true, data: [...] } (NOT users: [...])
            const usersRes = await axios.get(`${BASE_URL}/admin/users?role=TEACHER`, authHeaders);
            const users = usersRes.data.data || usersRes.data.users || []; // Fallback just in case
            const teacher = users.find(u => u.email === teacherEmail);

            if (!teacher) {
                console.error("DEBUG: Users found:", JSON.stringify(users, null, 2));
                throw new Error("Could not create/find teacher for class assignment.");
            }
            console.log(`   Teacher created: ${teacher.name} (${teacher._id})`);

            // 2c. Create Class
            const classRes = await axios.post(`${BASE_URL}/classes`, {
                name: CLASS_NAME,
                std: "6",
                division: "B",
                educationalYear: "2025-2026",
                classTeacherId: teacher._id
            }, authHeaders);

            classId = classRes.data._id || classRes.data.id;
            console.log(`✅ Class 6-B created. ID: ${classId}`);

        } catch (error) {
            console.error('❌ Class creation failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
            process.exit(1);
        }

        // ==========================================
        // STEP 3: BULK TEXT DATA (EXCEL)
        // ==========================================
        console.log('\n------------------------------------------------');
        console.log('Step 3: Bulk Text Upload (Excel)');

        if (!fs.existsSync(EXCEL_FILE_PATH)) {
            console.warn(`⚠️ Warning: Excel file not found at ${EXCEL_FILE_PATH}. Skipping step.`);
        } else {
            try {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(EXCEL_FILE_PATH));
                formData.append('classId', classId);

                const uploadRes = await axios.post(`${BASE_URL}/students/bulk-upload`, formData, {
                    headers: {
                        ...authHeaders.headers,
                        ...formData.getHeaders()
                    }
                });

                console.log('✅ Bulk Excel upload successful.');
                console.log(`   Uploaded: ${uploadRes.data.uploaded} students.`);
            } catch (error) {
                console.error('❌ Bulk Excel upload failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
                process.exit(1);
            }
        }

        // ==========================================
        // STEP 4: BULK PHOTO DATA (ZIP)
        // ==========================================
        console.log('\n------------------------------------------------');
        console.log('Step 4: Bulk Photo Upload (ZIP)');

        if (!fs.existsSync(ZIP_FILE_PATH)) {
            console.warn(`⚠️ Warning: ZIP file not found at ${ZIP_FILE_PATH}. Skipping step.`);
        } else {
            try {
                const formData = new FormData();
                formData.append('file', fs.createReadStream(ZIP_FILE_PATH));
                formData.append('classId', classId);

                const photoRes = await axios.post(`${BASE_URL}/students/bulk-photo-upload`, formData, {
                    headers: {
                        ...authHeaders.headers,
                        ...formData.getHeaders()
                    }
                });

                console.log('✅ Bulk ZIP upload successful.');
                console.log(`   Processed: ${photoRes.data.summary.total} files.`);
                console.log(`   Success: ${photoRes.data.summary.successCount}`);
                console.log(`   Skipped: ${photoRes.data.summary.skippedCount}`);
            } catch (error) {
                console.error('❌ Bulk ZIP upload failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
                process.exit(1);
            }
        }

        // ==========================================
        // STEP 5: FINAL VERIFICATION
        // ==========================================
        console.log('\n------------------------------------------------');
        console.log('Step 5: Verification');
        try {
            const studentsRes = await axios.get(`${BASE_URL}/students?classId=${classId}`, authHeaders);
            const students = studentsRes.data;

            console.log(`Fetched ${students.length} students from class 6-B.`);

            let withPhoto = 0;
            students.forEach(s => {
                if (s.profileImageUrl && s.profileImageUrl.includes('cloudinary')) {
                    withPhoto++;
                }
            });

            console.log(`Students with Cloudinary Profile Image: ${withPhoto}`);

            if (withPhoto > 0) {
                console.log('✅ Verification Passed: Students have updated profile images.');
            } else {
                console.log('❌ Verification Warning: No students found with Cloudinary images (did the ZIP upload work or match roll numbers?)');
            }

        } catch (error) {
            console.error('❌ Verification failed:', error.response ? JSON.stringify(error.response.data, null, 2) : error.message);
        }

        console.log('\nTest Completed.');
    } catch (metricError) {
        console.error('Unexpected error:', metricError);
    }
};

runTest();
