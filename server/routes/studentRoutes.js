// routes/student.js

const express = require("express");
const router = express.Router();

// Import models
const Student = require("../models/Student");
const Classroom = require("../models/Classroom");
const Photo = require("../models/Photo");

// =========================
// @route   POST /api/students
// @desc    Add a new student
// @access  Teacher/Admin
// =========================
router.post("/", async (req, res) => {
  try {
    const { name, rollNo, classroomId, gender, photo } = req.body;

    // Ensure classroom exists


    // const classroom = await Classroom.findById(classroomId);
    // if (!classroom) {
    //   return res.status(404).json({ error: "Classroom not found" });
    // }

    let photoId = null;
    // const className = `${classroom.standard}${classroom.division}`;

    // Create photo doc if provided
    if (photo) {
      const photoDoc = await Photo.create({
        ownerType: "student",
        ownerId: null, // will update after student is created
        url: photo,
        storage: "local"
      });
      photoId = photoDoc._id;
    }

    const student = new Student({
      name,
      rollNo,
      // classroomId,
      photoId,  // single photo reference
      gender
    });

    await student.save();

    // Update photo ownerId after student is created
    if (photoId) {
      await Photo.findByIdAndUpdate(photoId, { ownerId: student._id });
    }

    res.status(201).json(student);


    res.status(201).json({ message: "Student created successfully", student });
  } catch (err) {
    if (err.code === 11000) {
      // Duplicate rollNo in a classroom
      return res.status(400).json({ error: "Roll number already exists in this classroom" });
    }
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// =========================
// @route   GET /api/students
// @desc    Get all students (filter by classroom optional)
// @access  Teacher/Principal
// =========================
router.get("/", async (req, res) => {
  try {
    const { classroomId } = req.query;
    let filter = {};
    if (classroomId) filter.classroomId = classroomId;

    const students = await Student.find(filter)
      .populate("classroomId", "standard division")
      .populate("photoId", "url path createdAt");

    res.status(200).json(students);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// =========================
// @route   GET /api/students/:id
// @desc    Get single student
// @access  Teacher/Principal
// =========================
router.get("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate("classroomId", "standard division")
      .populate("photoId", "url path createdAt");

    if (!student) return res.status(404).json({ error: "Student not found" });

    res.status(200).json(student);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// =========================
// @route   PUT /api/students/:id
// @desc    Update student
// @access  Teacher/Admin
// =========================
router.put("/:id", async (req, res) => {
  try {
    const { name, rollNo, classroomId, gender, photo } = req.body;

    // Find the student
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // If classroomId provided, validate it
    // if (classroomId) {
    //   const classroom = await Classroom.findById(classroomId);
    //   if (!classroom) {
    //     return res.status(404).json({ error: "Classroom not found" });
    //   }
    //   student.classroomId = classroomId;

    //   // Update className ("6A")
    //   student.className = `${classroom.standard}${classroom.division}`;
    // }

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
router.delete("/:id", async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    // If student has a photo, delete it too
    if (student.photoId) {
      await Photo.findByIdAndDelete(student.photoId);
    }

    // Delete student
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

module.exports = router;
