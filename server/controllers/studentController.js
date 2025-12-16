// /server/controllers/studentController.js
const Student = require("../model/Student");
const Classroom = require("../model/Classroom");
const excelParser = require("../utils/excelParser");

exports.getStudents = async (req, res) => {
  try {
    const { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ message: "classId is required" });
    }

    const students = await Student.find({ classId }).sort({ rollNumber: 1 });
    res.json(students);

  } catch (err) {
    console.error("getStudents error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createStudent = async (req, res) => {
  try {
    const user = req.user;
    const { classId, name, rollNumber, dob, gender, profileImageUrl } = req.body;

    if (!classId || !name || !rollNumber) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const classExists = await Classroom.findById(classId);
    if (!classExists) return res.status(404).json({ message: "Classroom not found." });

    // Prevent duplicate roll numbers
    const existing = await Student.findOne({ classId, rollNumber });
    if (existing) return res.status(400).json({ message: "Roll number already exists in this class." });

    const newStudent = await Student.create({
      schoolId: user.schoolId,
      classId,
      name,
      rollNumber,
      dob,
      gender,
      profileImageUrl
    });

    res.status(201).json(newStudent);

  } catch (err) {
    console.error("createStudent error:", err);
    res.status(500).json({ message: "Server error", error: err.message, stack: err.stack });
  }
};


// UPDATE STUDENT
exports.updateStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const updated = await Student.findByIdAndUpdate(
      studentId,
      req.body,
      { new: true }
    );

    if (!updated) return res.status(404).json({ message: "Student not found." });

    res.json(updated);

  } catch (err) {
    console.error("updateStudent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// DELETE STUDENT
exports.deleteStudent = async (req, res) => {
  try {
    const studentId = req.params.id;

    const deleted = await Student.findByIdAndDelete(studentId);
    if (!deleted) return res.status(404).json({ message: "Student not found." });

    res.json({ message: "Student deleted." });

  } catch (err) {
    console.error("deleteStudent error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// BULK UPLOAD
exports.bulkUpload = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Excel file required." });

    const { classId } = req.body;
    if (!classId) return res.status(400).json({ message: "classId required." });

    const classExists = await Classroom.findById(classId);
    if (!classExists) return res.status(404).json({ message: "Classroom not found." });

    const parsed = await excelParser(req.file.path);

    let results = [];
    let validRows = [];

    for (let row of parsed) {
      let errors = [];

      if (!row.name) errors.push("name required");
      if (!row.rollNumber) errors.push("rollNumber required");

      if (errors.length) {
        results.push({ row: row.rowIndex, success: false, errors });
        continue;
      }

      // Check DB duplicates
      const exists = await Student.findOne({ classId, rollNumber: row.rollNumber });
      if (exists) {
        results.push({
          row: row.rowIndex,
          success: false,
          errors: ["Duplicate rollNumber in DB"]
        });
        continue;
      }

      validRows.push({
        schoolId: req.user.schoolId,
        classId,
        name: row.name,
        rollNumber: row.rollNumber,
        dob: row.dob || null,
        gender: row.gender || null,
        profileImageUrl: row.profileImageUrl || null
      });

      results.push({ row: row.rowIndex, success: true, errors: [] });
    }

    if (validRows.length > 0) {
      await Student.insertMany(validRows, { ordered: false });
    }

    res.json({ uploaded: validRows.length, results });

  } catch (err) {
    console.error("bulkUpload error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
