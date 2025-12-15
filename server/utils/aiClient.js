const Student = require('../model/Student');
const AttendanceRecord = require('../model/AttendanceRecord');

/**
 * Mock Face Recognition Trigger
 * Simulates AI processing by assigning random attendance status to students.
 * 
 * @param {string} sessionId - The ID of the attendance session
 * @param {string} classId - The ID of the class
 * @param {Array<string>} imageUrls - List of uploaded image URLs (unused in mock)
 */
const triggerFaceRecognition = async (sessionId, classId, imageUrls) => {
    try {
        console.log(`[Mock AI] Triggered for Session: ${sessionId}, Class: ${classId}`);

        // 1. Find all students in the class
        const students = await Student.find({ classId: classId, isActive: true });

        if (!students || students.length === 0) {
            console.log(`[Mock AI] No students found for Class: ${classId}`);
            return;
        }

        console.log(`[Mock AI] Found ${students.length} students. Processing...`);

        const recordsToInsert = [];

        // 2. Loop through students and prepare attendance records
        for (const student of students) {
            // Randomly assign 'P' (Present) or 'A' (Absent)
            // Let's bias it slightly towards Present (e.g., 80% chance)
            const isPresent = Math.random() < 0.8;
            const status = isPresent ? 'P' : 'A';
            const confidence = isPresent ? 0.98 : 0.0;

            recordsToInsert.push({
                sessionId: sessionId,
                studentId: student._id,
                status: status,
                source: 'SYSTEM',
                confidence: confidence,
                edited: false
            });
        }

        // 3. Bulk insert for efficiency
        if (recordsToInsert.length > 0) {
            // Use insertMany, but might need to handle potential duplicates if re-run 
            // (though logic implies new session). 
            // For safety in this mock, we can use a loop or insertMany with ordered:false to ignore dupes if desired,
            // but standard insertMany is fine for a fresh session context.
            await AttendanceRecord.insertMany(recordsToInsert);
        }

        console.log(`[Mock AI] Successfully created ${recordsToInsert.length} attendance records.`);

    } catch (error) {
        console.error('[Mock AI] Error triggering face recognition:', error);
        // In a real system, we might update the session status to 'FAILED' here
    }
};

module.exports = {
    triggerFaceRecognition
};
