// src/api/attendance.api.js

const MOCK_ATTENDANCE_RESULTS = [
    { id: "1", rollNo: 1, name: "Aarav Patel", status: "P" },
    { id: "2", rollNo: 2, name: "Diya Shah", status: "P" },
    { id: "3", rollNo: 3, name: "Rohan Mehta", status: "A" },
    { id: "4", rollNo: 4, name: "Kavya Desai", status: "P" },
    { id: "5", rollNo: 5, name: "Neel Joshi", status: "P" },
];

export const uploadClassroomImages = async (formData) => {
    // Simulates AI processing
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                detectedStudents: MOCK_ATTENDANCE_RESULTS,
                message: "AI Analysis Complete"
            });
        }, 3000); // 3s delay for "processing"
    });
};

export const submitAttendance = async (classId, date, attendanceRecrods) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                success: true,
                message: "Attendance Synced Successfully"
            });
        }, 1500);
    });
};
