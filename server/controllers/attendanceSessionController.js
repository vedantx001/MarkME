const AttendanceSession = require('../model/AttendanceSession');
const ClassroomImage = require('../model/ClassroomImage');
const AttendanceRecord = require('../model/AttendanceRecord');
const Student = require('../model/Student');
const Classroom = require('../model/Classroom');

// Helper to normalize date to start of day
const getStartOfDay = (dateString) => {
    const d = new Date(dateString);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

/**
 * Fetch existing session or create a new one
 * Route: POST /api/attendance-sessions
 */
exports.fetchOrCreateSession = async (req, res) => {
    try {
        const { classId, date, teacherId } = req.body; // teacherId might come from auth middleware in real app, assuming body for now or req.user

        if (!classId || !date) {
            return res.status(400).json({ message: 'classId and date are required' });
        }

        const queryDate = getStartOfDay(date);

        // Check if session exists for this class and date
        let session = await AttendanceSession.findOne({
            classId: classId,
            date: queryDate
        });

        if (session) {
            return res.status(200).json(session);
        }

        // Fetch class to get schoolId
        const classroom = await Classroom.findById(classId);
        if (!classroom) {
            return res.status(404).json({ message: 'Classroom not found' });
        }

        // Create new session
        // Note: 'PENDING' is the default status, which we use as 'IN_PROGRESS' equivalent
        session = new AttendanceSession({
            schoolId: classroom.schoolId,
            classId,
            date: queryDate,
            teacherId: teacherId || req.body.teacherId, // Ensure teacherId is passed
            status: 'PENDING'
        });

        await session.save();
        return res.status(201).json(session);

    } catch (error) {
        console.error('Error in fetchOrCreateSession:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

/**
 * Get full session details including images and records
 * Route: GET /api/attendance-sessions/:id
 */
exports.getSessionDetails = async (req, res) => {
    try {
        const sessionId = req.params.id;

        const session = await AttendanceSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        const images = await ClassroomImage.find({ sessionId });

        // Fetch records and populate student details
        const records = await AttendanceRecord.find({ sessionId })
            .populate('studentId', 'name rollNumber profileImageUrl');

        res.status(200).json({
            session,
            images,
            records
        });

    } catch (error) {
        console.error('Error in getSessionDetails:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
