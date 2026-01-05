const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const path = require('path');

// CONFIG
const API_URL = 'http://localhost:5000/api';
const ADMIN_EMAIL = 'admin@example.com'; // Adjust as needed
const ADMIN_PASSWORD = 'password123'; // Adjust as needed
const FILE_PATH = path.join(__dirname, 'test-students.xlsx'); // Make sure this exists

async function runTest() {
    try {
        // 1. Login
        console.log("Logging in...");
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD
        });
        const token = loginRes.data.token;
        const schoolId = loginRes.data.user.schoolId;
        console.log("Logged in. School ID:", schoolId);

        // 2. Create a Dummy Class (or use existing)
        console.log("Creating dummy class...");
        // Assuming you have a create class endpoint or just pick one if you know the ID.
        // For now, let's try to fetch classes and pick the first one, or create one.
        let classId;
        try {
            const classesRes = await axios.get(`${API_URL}/classes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (classesRes.data.length > 0) {
                classId = classesRes.data[0]._id;
                console.log("Using existing class:", classId);
            } else {
                const newClass = await axios.post(`${API_URL}/classes`, {
                    name: "Test Class Bulk",
                    standard: "10",
                    section: "Z"
                }, { headers: { Authorization: `Bearer ${token}` } });
                classId = newClass.data._id;
                console.log("Created new class:", classId);
            }
        } catch (e) {
            console.log("Class fetch/create failed, strictly needing existing class or valid logic.");
            throw e;
        }

        // 3. Create a dummy Excel file if not exists
        if (!fs.existsSync(FILE_PATH)) {
            console.log("Creating dummy Excel file...");
            const xlsx = require('xlsx');
            const wb = xlsx.utils.book_new();
            const ws = xlsx.utils.json_to_sheet([
                { name: "John Doe Bulk", rollNumber: "B001", dob: "2010-01-01", gender: "Male" },
                { name: "Jane Smith Bulk", rollNumber: "B002", dob: "2010-02-02", gender: "Female" }
            ]);
            xlsx.utils.book_append_sheet(wb, ws, "Sheet1");
            xlsx.writeFile(wb, FILE_PATH);
        }

        // 4. Upload
        console.log("Uploading Bulk Excel...");
        const form = new FormData();
        form.append('excelFile', fs.createReadStream(FILE_PATH)); // Matches field name 'excelFile'
        form.append('classId', classId);

        const uploadRes = await axios.post(`${API_URL}/students/bulk-upload`, form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });

        console.log("Upload Success:", uploadRes.data);

        // 5. Verify file cleanup (Manual check or log check)
        console.log("Please check server logs for Cloudinary URL and ensure local /tmp file is gone.");

    } catch (err) {
        console.error("Test Failed:", err.response ? err.response.data : err.message);
    }
}

runTest();
