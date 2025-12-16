// /server/routes/students.routes.js
const express = require("express");
const router = express.Router();

const studentController = require("../controllers/studentController");
const auth = require("../middlewares/authMiddleware");
const { requireRole, requireAnyRole } = require("../middlewares/roleMiddleware");
const { uploadExcel } = require("../middlewares/uploadMiddleware");

/*
    ================================
    @route   GET /api/students
    @desc    Get list of students by classId
    @access  Authenticated (Teacher/Admin)
    ================================
*/
router.get("/", auth, studentController.getStudents);

/*
    ================================
    @route   POST /api/students
    @desc    Add a single student
    @access  Teacher/Admin
    ================================
*/
router.post("/", auth, requireAnyRole(["ADMIN", "TEACHER"]), studentController.createStudent);

/*
    ================================
    @route   PUT /api/students/:id
    @desc    Update student details
    @access  Teacher/Admin
    ================================
*/
router.put("/:id", auth, requireAnyRole(["ADMIN", "TEACHER"]), studentController.updateStudent);

/*
    ================================
    @route   DELETE /api/students/:id
    @desc    Delete a student record
    @access  Admin
    ================================
*/
router.delete("/:id", auth, requireRole("ADMIN"), studentController.deleteStudent);

/*
    ================================================
    @route   POST /api/students/bulk-upload
    @desc    Upload Excel file (.xlsx) and add students
             Excel columns required:
             name, rollNumber, dob, gender, profileImageUrl
    @access  Teacher/Admin
    ================================================
*/
router.post(
    "/bulk-upload",
    auth,
    requireAnyRole(["ADMIN", "TEACHER"]),
    uploadExcel.single("file"),
    studentController.bulkUpload
);

module.exports = router;
