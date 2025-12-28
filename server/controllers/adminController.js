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
      const schoolId = admin.schoolId?._id ? admin.schoolId._id : admin.schoolId;
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
      const schoolId = admin.schoolId?._id ? admin.schoolId._id : admin.schoolId;
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

  // Update teacher/principal (ADMIN only)
  updateUser: async (req, res, next) => {
    try {
      const admin = req.user;
      const schoolId = admin.schoolId?._id ? admin.schoolId._id : admin.schoolId;
      if (!schoolId) return res.status(400).json({ success: false, message: 'Admin missing school context' });

      const { id } = req.params;
      const { name, email, password, isActive } = req.body || {};

      const user = await User.findOne({ _id: id, schoolId }).lean();
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });
      if (!['TEACHER', 'PRINCIPAL'].includes(user.role)) {
        return res.status(422).json({ success: false, message: 'Only TEACHER/PRINCIPAL can be updated via this route' });
      }

      const update = {};
      if (typeof name === 'string' && name.trim()) update.name = name.trim();
      if (typeof email === 'string' && email.trim()) update.email = email.trim().toLowerCase();
      if (typeof isActive === 'boolean') update.isActive = isActive;
      if (typeof password === 'string' && password) {
        if (password.length < 8) return res.status(422).json({ success: false, message: 'Password must be at least 8 characters' });
        update.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      }

      // email uniqueness across system
      if (update.email && update.email !== user.email) {
        const exists = await User.findOne({ email: update.email });
        if (exists) return res.status(409).json({ success: false, message: 'Email already in use' });
      }

      const updated = await User.findByIdAndUpdate(id, update, { new: true }).select('-passwordHash').lean();

      return res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  // Delete teacher (ADMIN only). Principal deletion disallowed.
  deleteUser: async (req, res, next) => {
    try {
      const admin = req.user;
      const schoolId = admin.schoolId?._id ? admin.schoolId._id : admin.schoolId;
      if (!schoolId) return res.status(400).json({ success: false, message: 'Admin missing school context' });

      const { id } = req.params;
      const user = await User.findOne({ _id: id, schoolId });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      if (user.role === 'PRINCIPAL') {
        return res.status(403).json({ success: false, message: 'Principal cannot be deleted' });
      }
      if (user.role !== 'TEACHER') {
        return res.status(422).json({ success: false, message: 'Only TEACHER can be deleted via this route' });
      }

      await User.deleteOne({ _id: id });
      return res.json({ success: true, message: 'Teacher deleted' });
    } catch (err) {
      next(err);
    }
  },
};
