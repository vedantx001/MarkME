const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// CREATE CLASSROOM (teacher only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { standard, division } = req.body;

    const exists = await Classroom.findOne({
      schoolId: req.user.schoolId,
      standard,
      division
    });
    if (exists) return res.status(400).json({ error: "Classroom already exists" });

    const classroom = new Classroom({
      schoolId: req.user.schoolId,
      standard,
      division,
      teacherId: req.user.id
    });

    await classroom.save();
    res.status(201).json(classroom);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL CLASSROOMS (teacher/principal)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const classrooms = await Classroom.find({ schoolId: req.user.schoolId })
      .populate('teacherId', 'name email');
    res.json(classrooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE CLASSROOM (teacher only)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { standard, division } = req.body;

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    if (standard) classroom.standard = standard;
    if (division) classroom.division = division;

    await classroom.save();
    res.json({ message: "Classroom updated successfully", classroom });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Classroom with this standard/division already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE CLASSROOM (teacher only)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Access denied" });
    }

    const classroom = await Classroom.findById(req.params.id);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    
    // // Ensure the classroom belongs to the same school
    // if (classroom.schoolId.toString() !== req.user.schoolId) {
    //   return res.status(403).json({ error: "Cannot delete classroom of another school",req.user.schoolId });
    // }

    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ message: "Classroom deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
