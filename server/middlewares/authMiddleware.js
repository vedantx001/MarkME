const jwt = require('jsonwebtoken');
const User = require('../model/User');

const JWT_SECRET = process.env.JWT_SECRET;

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }

    // Attach user minimal info
    const user = await User.findById(payload.sub).select('-passwordHash').lean();
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId?.toString(),
      raw: user, // full user doc (without passwordHash) for controllers if needed
    };

    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authMiddleware;
