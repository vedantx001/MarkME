const express = require('express');
const router = express.Router();
const Classroom = require('../models/Classroom');
const Student = require("../models/Student");
const Photo = require( "../models/Photo");
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

// CREATE CLASSROOM (teacher only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: "Access denied" });
    }

    const { standard, division } = req.body;
    const std = Number(standard);
    const div = String(division || '').toUpperCase();
    if (!Number.isInteger(std) || std < 1 || std > 12) {
      return res.status(400).json({ error: "Standard must be an integer between 1 and 12" });
    }
    if (!['A', 'B', 'C', 'D'].includes(div)) {
      return res.status(400).json({ error: "Division must be one of A, B, C, D" });
    }

    // A teacher can create only one classroom (per school)
    const alreadyOwned = await Classroom.findOne({
      schoolId: req.user.schoolId,
      teacherId: req.user.id
    });
    if (alreadyOwned) {
      return res.status(400).json({ error: "Teacher already has a classroom" });
    }

    const exists = await Classroom.findOne({
      schoolId: req.user.schoolId,
      standard: std,
      division: div
    });
    if (exists) return res.status(400).json({ error: "Classroom already exists" });

    const classroom = new Classroom({
      schoolId: req.user.schoolId,
      standard: std,
      division: div,
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
      .populate({ path: 'teacherId', select: 'name email', options: { strictPopulate: false } });
    res.json(classrooms);
  } catch (err) {
    // Fallback: return without populate if populate fails
    try {
      const classrooms = await Classroom.find({ schoolId: req.user.schoolId });
      res.json(classrooms);
    } catch (e2) {
      res.status(500).json({ error: err.message });
    }
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

    // Ensure ownership and same school
    if (String(classroom.teacherId) !== String(req.user.id) || classroom.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: "You can only update your own classroom" });
    }

    if (standard !== undefined) {
      const std = Number(standard);
      if (!Number.isInteger(std) || std < 1 || std > 12) {
        return res.status(400).json({ error: "Standard must be an integer between 1 and 12" });
      }
      classroom.standard = std;
    }
    if (division !== undefined) {
      const div = String(division).toUpperCase();
      if (!['A', 'B', 'C', 'D'].includes(div)) {
        return res.status(400).json({ error: "Division must be one of A, B, C, D" });
      }
      classroom.division = div;
    }

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

    // Ensure the classroom belongs to the same teacher and school
    if (String(classroom.teacherId) !== String(req.user.id) || classroom.schoolId !== req.user.schoolId) {
      return res.status(403).json({ error: "You can only delete your own classroom" });
    }

    // 🔹 Find all students in this classroom
    const students = await Student.find({ classroomId: classroom._id });

    // 🔹 Delete all photos linked to these students
    const photoIds = students.map(s => s.photoId).filter(Boolean);
    if (photoIds.length > 0) {
      await Photo.deleteMany({ _id: { $in: photoIds } });
    }

    await Student.deleteMany({ classroomId: classroom._id });

    await Classroom.findByIdAndDelete(req.params.id);
    res.json({ message: "Classroom deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
