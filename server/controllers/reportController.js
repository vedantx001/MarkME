const Student = require('../model/Student');
const AttendanceSession = require('../model/AttendanceSession');
const AttendanceRecord = require('../model/AttendanceRecord');
const ClassroomImage = require('../model/ClassroomImage');
const { generateMonthlyExcel } = require('../utils/csvExport');
const path = require('path');

// 1. Get Monthly Class Report
const getMonthlyClassReport = async (req, res) => {
    try {
        let { classId, month, year, date } = { ...req.query, ...req.params };

        // Handle :date param (YYYY-MM)
        if (date && !month && !year) {
            const parts = date.split('-');
            if (parts.length === 2) {
                year = parseInt(parts[0]);
                month = parseInt(parts[1]);
            }
        }

        if (!classId || !month || !year) {
            return res.status(400).json({ message: 'Missing required parameters: classId, month, year' });
        }

        // Calculate Date Range
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0); // Last day of the month

        // Fetch Students
        const students = await Student.find({ classId }).sort({ rollNumber: 1 });

        // Fetch Sessions
        const sessions = await AttendanceSession.find({
            classId: classId,
            date: { $gte: startDate, $lte: endDate }
        });

        if (sessions.length === 0) {
            return res.status(404).json({ message: 'No sessions found for this month.' });
        }

        const sessionIds = sessions.map(s => s._id);

        // Fetch Records
        const records = await AttendanceRecord.find({
            sessionId: { $in: sessionIds }
        });

        // Generate Excel
        const buffer = await generateMonthlyExcel(students, sessions, records, year, month);

        // Send Response
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="Attendance_Report_${year}_${month}.xlsx"`);
        res.send(buffer);

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// 2. Get Session Summary
const getSessionSummary = async (req, res) => {
    try {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required' });
        }

        const presentCount = await AttendanceRecord.countDocuments({ sessionId, status: 'P' });
        const absentCount = await AttendanceRecord.countDocuments({ sessionId, status: 'A' });

        res.json({
            total: presentCount + absentCount,
            present: presentCount,
            absent: absentCount
        });

    } catch (error) {
        console.error('Error fetching session summary:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// 3. Get Image Metadata
const getImageMetadata = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'Image ID is required' });
        }

        const image = await ClassroomImage.findById(id);

        if (!image) {
            return res.status(404).json({ message: 'Image not found' });
        }

        // Assuming ClassroomImage has an 'imageUrl' or 'path' field. 
        // Based on typical schema, let's return the URL/path. 
        // If the query asks for metadata, we can return the whole object or specific fields.
        // Requirement says "Return the image URL/path".

        res.json({
            imageUrl: image.imageUrl,
            // Including other metadata might be useful
            uploadedAt: image.createdAt
        });

    } catch (error) {
        console.error('Error fetching image metadata:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

module.exports = {
    getMonthlyClassReport,
    getSessionSummary,
    getImageMetadata
};