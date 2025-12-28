// src/api/student.api.js

const MOOCK_STUDENTS = [
    { id: "1", rollNo: 1, name: "Aarav Patel", gender: "Male", dob: "12 June 2004", photo: "https://i.pravatar.cc/300?img=11" },
    { id: "2", rollNo: 2, name: "Diya Shah", gender: "Female", dob: "03 Sept 2004", photo: "https://i.pravatar.cc/300?img=5" },
    { id: "3", rollNo: 3, name: "Rohan Mehta", gender: "Male", dob: "18 Feb 2004", photo: "https://i.pravatar.cc/300?img=12" },
    { id: "4", rollNo: 4, name: "Kavya Desai", gender: "Female", dob: "21 Nov 2004", photo: "https://i.pravatar.cc/300?img=9" },
];

const MOCK_STUDENT_DETAIL = {
    id: "1",
    name: "Aarav Patel",
    rollNo: 1,
    email: "aarav.patel@school.com",
    phone: "+91 98765 43210",
    attendancePercentage: 88,
    totalPresents: 22,
    totalAbsents: 3,
};

// Generator for Academic Year 2025-26 (June 1, 2025 to April 30, 2026)
const generateAcademicYearHistory = () => {
    const result = [];
    const start = new Date("2025-06-01");
    const end = new Date("2026-04-30");
    const today = new Date(); // To only mark "P/A" up to today, rest as null (future)

    // Mock specific absences for realism
    const absences = ["2025-07-10", "2025-08-15", "2025-09-02", "2025-11-20", "2025-12-18", "2026-01-15"];
    const absenceSet = new Set(absences);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split("T")[0];
        const isWeekend = d.getDay() === 0 || d.getDay() === 6; // 0=Sun, 6=Sat

        let status = null;

        // Logic: Only generate status if date <= today
        if (d <= today && !isWeekend) {
            status = absenceSet.has(dateStr) ? "A" : "P";
        }

        result.push({
            date: dateStr,
            status: status, // "P", "A", or null (weekend/future)
            day: d.getDate(),
            month: d.toLocaleString('default', { month: 'long' }),
            year: d.getFullYear(),
            dayOfWeek: d.getDay() // Useful for grid alignment
        });
    }
    return result;
};

export const fetchClassroomStudents = async (classId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(MOOCK_STUDENTS);
        }, 800); // Simulate network delay
    });
};

export const fetchStudentDetail = async (studentId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            // For mock purposes, we return the same detail for any ID
            resolve({ ...MOCK_STUDENT_DETAIL, id: studentId });
        }, 600);
    });
};

export const fetchStudentStreak = async (studentId) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(generateAcademicYearHistory());
        }, 600);
    });
};
