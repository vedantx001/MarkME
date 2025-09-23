const express = require("express");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role, schoolID: user.schoolID }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

router.post("/register", async (req, res) => {
  const { name, email, password, role, schoolID } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ msg: "User already exists" });

    user = await User.create({ name, email, password, role, schoolID });
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolID: user.schoolID,
      token: generateToken(user)
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ msg: "Invalid Credentials" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolID: user.schoolID,
      token: generateToken(user)
    });
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

router.get("/profile", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;