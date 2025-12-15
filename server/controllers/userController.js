// /server/controllers/userController.js
// Ensure route is protected using authMiddleware when wired
module.exports = {
  getMe: async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ success: false, message: 'Not authenticated' });

      // Return sanitized profile from req.user.raw (attached in authMiddleware)
      const profile = req.user.raw ? { ...req.user.raw } : {};
      // ensure passwordHash not included
      if (profile.passwordHash) delete profile.passwordHash;

      return res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },
};
