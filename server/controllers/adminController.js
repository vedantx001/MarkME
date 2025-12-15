const bcrypt = require('bcrypt');
const User = require('../model/User');
const School = require('../model/School');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

module.exports = {
  // Create teacher/principal
  createUser: async (req, res, next) => {
    try {
      const admin = req.user; // from authMiddleware
      const { name, email, password, role } = req.body;

      if (!name || !email || !password || !role) return res.status(422).json({ success: false, message: 'Missing fields' });

      const roleUpper = role.toUpperCase();
      if (!['TEACHER', 'PRINCIPAL'].includes(roleUpper)) {
        return res.status(422).json({ success: false, message: 'Invalid role' });
      }

      // Only create within admin's school
      const schoolId = admin.schoolId;
      if (!schoolId) return res.status(400).json({ success: false, message: 'Admin missing school context' });

      // Email must be unique across system
      const exists = await User.findOne({ email: email.toLowerCase() });
      if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const created = await User.create({
        schoolId,
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: roleUpper,
        isActive: true,
      });

      return res.status(201).json({
        success: true,
        user: { id: created._id, name: created.name, email: created.email, role: created.role, schoolId: created.schoolId },
      });
    } catch (err) {
      next(err);
    }
  },

  // List users by school (admin's school). Supports ?role=TEACHER or PRINCIPAL and pagination
  listUsers: async (req, res, next) => {
    try {
      const admin = req.user;
      const schoolId = admin.schoolId;
      if (!schoolId) return res.status(400).json({ success: false, message: 'Admin missing school context' });

      const { role, page = 1, limit = 50 } = req.query;
      const q = { schoolId };

      if (role) q.role = role.toUpperCase();

      const skip = (Math.max(1, Number(page)) - 1) * Number(limit);

      const users = await User.find(q).select('-passwordHash').skip(skip).limit(Number(limit)).lean();
      const total = await User.countDocuments(q);

      return res.json({
        success: true,
        meta: { total, page: Number(page), limit: Number(limit) },
        data: users,
      });
    } catch (err) {
      next(err);
    }
  },
};
