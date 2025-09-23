const express = require("express");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, schoolId: user.schoolId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password, role, schoolId } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = await User.create({ name, email, password, role, schoolId });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      token: generateToken(user)
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.verifyPassword(password))) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId,
      token: generateToken(user)
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

// PROFILE
router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-passwordHash");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
