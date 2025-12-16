// /server/routes/classes.routes.js
const express = require("express");
const router = express.Router();

const classController = require("../controllers/classController");
const auth = require("../middlewares/authMiddleware");
const { requireRole: role } = require("../middlewares/roleMiddleware");

/*
    ================================
    @route   GET /api/classes
    @desc    Get list of classes
             - ADMIN: sees all classes in school
             - TEACHER: sees only their assigned classes
    @access  Authenticated (Teacher/Admin)
    ================================
*/
router.get("/", auth, classController.getClasses);

/*
    ================================
    @route   POST /api/classes
    @desc    Create a new class
    @access  Admin
    ================================
*/
router.post("/", auth, role("ADMIN"), classController.createClass);

module.exports = router;
