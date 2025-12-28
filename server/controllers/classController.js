// /server/controllers/classController.js
const Classroom = require("../model/Classroom");
const User = require("../model/User");

exports.getClasses = async (req, res) => {
  try {
    const user = req.user;

    let query = {};
    if (user.role === "TEACHER") {
      query.classTeacherId = user.id; // use stable id
    } else if (user.role === "ADMIN") {
      // admin sees all classes under same school
      query.schoolId = user.schoolId; // normalized in authMiddleware
    } else {
      return res.status(403).json({ message: "Not allowed." });
    }

    const classes = await Classroom.find(query).populate("classTeacherId", "name email");
    res.json(classes);

  } catch (err) {
    console.error("getClasses error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.createClass = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can create classes." });
    }

    const { educationalYear, std, division, classTeacherId, name } = req.body;

    if (!educationalYear || !std || !division || !classTeacherId) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const teacher = await User.findById(classTeacherId);
    if (!teacher || teacher.role !== "TEACHER") {
      return res.status(400).json({ message: "Invalid class teacher." });
    }

    const newClass = await Classroom.create({
      schoolId: user.schoolId, // normalized in authMiddleware
      educationalYear,
      std,
      division,
      classTeacherId,
      name: name || `${std}-${division} (${educationalYear})`
    });

    res.status(201).json(newClass);

  } catch (err) {
    console.error("createClass error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Classroom already exists." });
    }
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateClass = async (req, res) => {
  try {
    const user = req.user;
    if (user.role !== "ADMIN") {
      return res.status(403).json({ message: "Only admin can update classes." });
    }

    const { id } = req.params;
    const classroom = await Classroom.findOne({ _id: id, schoolId: user.schoolId });
    if (!classroom) {
      return res.status(404).json({ message: "Classroom not found." });
    }

    const { educationalYear, std, division, classTeacherId, name } = req.body;

    // Apply partial updates
    if (educationalYear != null) classroom.educationalYear = educationalYear;
    if (std != null) classroom.std = std;
    if (division != null) classroom.division = division;

    if (classTeacherId != null) {
      const teacher = await User.findById(classTeacherId);
      if (!teacher || teacher.role !== "TEACHER") {
        return res.status(400).json({ message: "Invalid class teacher." });
      }
      classroom.classTeacherId = classTeacherId;
    }

    if (typeof name === 'string') {
      classroom.name = name.trim();
    } else if (!name && (educationalYear || std || division)) {
      classroom.name = `${classroom.std}-${classroom.division} (${classroom.educationalYear})`;
    }

    const saved = await classroom.save();
    const populated = await Classroom.findById(saved._id).populate("classTeacherId", "name email");
    return res.json(populated);
  } catch (err) {
    console.error("updateClass error:", err);
    if (err.code === 11000) {
      return res.status(400).json({ message: "Classroom already exists." });
    }
    res.status(500).json({ message: "Server error" });
  }
};
