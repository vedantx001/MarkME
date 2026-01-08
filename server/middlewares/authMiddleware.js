const jwt = require('jsonwebtoken');
const User = require('../model/User');
const RefreshToken = require('../model/RefreshToken');

const JWT_SECRET = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    let userId = null;

    // 1) Prefer access token when present
    if (bearerToken) {
      let payload;
      try {
        payload = jwt.verify(bearerToken, JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
      }
      userId = payload?.sub || null;
    }

    // 2) Fallback to refreshToken cookie/body if no access token.
    // This supports flows where the client relies on cross-site cookies.
    if (!userId) {
      const incomingRefresh = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!incomingRefresh) {
        return res.status(401).json({ success: false, message: 'No token provided' });
      }

      const crypto = require('crypto');
      const refreshHash = crypto.createHash('sha256').update(incomingRefresh).digest('hex');

      const stored = await RefreshToken.findOne({ tokenHash: refreshHash }).lean();
      if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      userId = stored.userId?.toString() || null;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }
    }

    // Attach user minimal info
    const user = await User.findById(userId)
      .select('-passwordHash')
      .populate('schoolId', 'name schoolIdx address')
      .lean();

    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      // When populated, schoolId is an object. Keep a stable id string and also expose the full populated school.
      schoolId: user.schoolId?._id ? user.schoolId._id.toString() : user.schoolId?.toString(),
      school: user.schoolId && typeof user.schoolId === 'object' ? user.schoolId : null,
      raw: user, // full user doc (without passwordHash) for controllers if needed
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
