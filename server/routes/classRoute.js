// classRoute.js
const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const School = require('../models/School');

// ------------------
// GET all classrooms
// ------------------
router.get('/', async (req, res) => {
    try {
        const classrooms = await Classroom.find()
            .populate('teacherId', 'name email role')  // optional: show teacher details
            .populate('schoolId', 'name code');       // optional: show school details
        res.json(classrooms);
    } catch (err) {
        console.error('Error fetching classrooms:', err);
        res.status(500).json({ error: 'Server error fetching classrooms' });
    }
});

// ------------------
// POST a new classroom
// ------------------
router.post('/', async (req, res) => {
    try {
        const { schoolId, standard, division, teacherId, meta } = req.body;

        // Validate required fields
        if (!schoolId || !standard || !division || !teacherId) {
            return res.status(400).json({ error: 'schoolId, standard, division, and teacherId are required' });
        }

        // Optional: Check if school and teacher exist
        const school = await School.findById(schoolId);
        if (!school) return res.status(404).json({ error: 'School not found' });

        const teacher = await User.findById(teacherId);
        if (!teacher) return res.status(404).json({ error: 'Teacher not found' });
        if (teacher.role !== 'teacher') return res.status(400).json({ error: 'User is not a teacher' });

        // Check duplicate classroom for the same school
        const exists = await Classroom.findOne({ schoolId, standard, division });
        if (exists) return res.status(400).json({ error: 'Classroom already exists for this school' });

        const classroom = new Classroom({
            schoolId,
            standard,
            division,
            teacherId,
            meta
        });

        await classroom.save();
        res.status(201).json(classroom);
    } catch (err) {
        console.error('Error creating classroom:', err);
        res.status(500).json({ error: 'Server error creating classroom' });
    }
});


// Update classroom by ID
router.put('/:id', async (req, res) => {
    try {
        const { standard, division, teacherId, meta } = req.body;
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

        if (standard) classroom.standard = standard;
        if (division) classroom.division = division;
        if (teacherId) classroom.teacherId = teacherId;
        if (meta) classroom.meta = meta;

        await classroom.save();
        res.json({ success: true, classroom });
    } catch (err) {
        console.error('Error updating classroom:', err);
        res.status(500).json({ error: 'Server error updating classroom' });
    }
});

// Delete classroom by ID
router.delete('/:id', async (req, res) => {
    try {
        const classroom = await Classroom.findByIdAndDelete(req.params.id);

        if (!classroom) return res.status(404).json({ error: 'Classroom not found' });

        res.json({ success: true, message: 'Classroom deleted successfully' });
    } catch (err) {
        console.error('Error deleting classroom:', err);
        res.status(500).json({ error: 'Server error deleting classroom' });
    }
});

module.exports = router;
