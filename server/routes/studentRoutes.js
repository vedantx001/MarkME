const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Student = require('../models/Student');
const Classroom = require('../models/Classroom');
const Photo = require('../models/Photo');
const authMiddleware = require('../middleware/authMiddleware');

// ADD STUDENT (teacher only)
router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: "Access denied" });

    const { name, rollNo, gender, photo, classroomId } = req.body;

    const classroom = await Classroom.findById(classroomId);
    if (!classroom) return res.status(404).json({ error: "Classroom not found" });

    // Optional: store className automatically
    const className = `${classroom.standard}${classroom.division}`;

    // Step 1: create student first (without photoId yet)
    let student = new Student({
      name,
      rollNo,
      gender,
      classroomId,
      className,
    });

    await student.save();

    // Step 2: create photo (only if provided)
    if (photo) {
      const photoDoc = await Photo.create({
        ownerType: "student",
        ownerId: student._id,
        url: photo,
        storage: "local",
      });

      // Update student with photoId
      student.photoId = photoDoc._id;
      await student.save();
    }

    res.status(201).json(student);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: "Duplicate rollNo in classroom" });
    res.status(500).json({ error: err.message });
  }
});

// GET STUDENTS (filter by classroom optional)
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { classroomId } = req.query;
    let filter = {};
    if (classroomId) {
      if (!mongoose.isValidObjectId(classroomId)) {
        return res.status(400).json({ error: "Invalid classroomId" });
      }
      filter.classroomId = classroomId;
    }

    const students = await Student.find(filter)
      .populate("classroomId", "standard division")
      .populate("photoId", "url path createdAt");

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single student by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("classroomId", "standard division")
      .populate("photoId", "url path createdAt");

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE STUDENT
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    if (!['teacher','admin'].includes(req.user.role)) return res.status(403).json({ error: "Access denied" });

    const { name, rollNo, classroomId, gender, photo } = req.body;

    // Find the student
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // If classroomId provided, validate it
    if (classroomId) {
      const classroom = await Classroom.findById(classroomId);
      if (!classroom) {
        return res.status(404).json({ error: "Classroom not found" });
      }
      // Ensure same school and ownership for teachers
      if (req.user.role === 'teacher') {
        if (String(classroom.teacherId) !== String(req.user.id) || classroom.schoolId !== req.user.schoolId) {
          return res.status(403).json({ error: "You can only move students to your own classroom" });
        }
      }
      student.classroomId = classroomId;

      // Update className ("6A")
      student.className = `${classroom.standard}${classroom.division}`;
    }

    // Update student fields
    if (name) student.name = name;
    if (rollNo) student.rollNo = rollNo;
    if (gender) student.gender = gender;

    // If new photo provided
    if (photo) {
      // Delete old photo doc (optional, if you don’t want multiple photos)
      if (student.photoId) {
        await Photo.findByIdAndDelete(student.photoId);
      }

      // Create new photo doc
      const photoDoc = await Photo.create({
        ownerType: "student",
        ownerId: student._id,
        url: photo,
        storage: "local"
      });

      student.photoId = photoDoc._id;
    }

  // Save updated student
    await student.save();

    res.status(200).json({ message: "Student updated successfully", student });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate roll number in classroom" });
    }
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// =========================
// @route   DELETE /api/students/:id
// @desc    Delete student and unlink photos
// @access  Teacher/Admin
// =========================
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (!['teacher','admin'].includes(req.user.role)) return res.status(403).json({ error: "Access denied" });
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // Verify teacher owns the classroom for this student
    if (req.user.role === 'teacher') {
      const classroom = await Classroom.findById(student.classroomId);
      if (!classroom) return res.status(404).json({ error: "Classroom not found" });
      if (String(classroom.teacherId) !== String(req.user.id) || classroom.schoolId !== req.user.schoolId) {
        return res.status(403).json({ error: "You can only delete students from your own classroom" });
      }
    }

    // If student has a photo, delete it too
    if (student.photoId) {
      await Photo.findByIdAndDelete(student.photoId);
    }

    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
