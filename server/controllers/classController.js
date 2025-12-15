// /server/controllers/classController.js
const Classroom = require("../model/Classroom");
const User = require("../model/User");

exports.getClasses = async (req, res) => {
  try {
    const user = req.user;

    let query = {};
    if (user.role === "TEACHER") {
      query.classTeacherId = user._id;
    } else if (user.role === "ADMIN") {
      // admin sees all classes under same school
      query.schoolId = user.schoolId;
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
      schoolId: user.schoolId,
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
