const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

const School = require('../model/School');
const User = require('../model/User');
const RefreshToken = require('../model/RefreshToken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXP = process.env.JWT_EXP || '7d'; // 7 days as requested
const REFRESH_TOKEN_EXP_DAYS = parseInt(process.env.REFRESH_TOKEN_EXP_DAYS || '30', 10);
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

function generateAccessToken(user) {
  const payload = {
    sub: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    schoolId: user.schoolId?.toString(),
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXP });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

async function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Placeholder: replace with real mailer integration
async function sendEmail({ to, subject, text, html }) {
  // TODO: implement real mailer (SendGrid/nodemailer etc.)
  // For dev/testing: we're returning true. In production, do not return tokens in responses.
  // console.log('SEND EMAIL', { to, subject, text });
  return true;
}

module.exports = {
  // register-admin: create School + Admin (transactional)
  registerAdmin: async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { schoolIdx, schoolName, address, adminName, adminEmail, password } = req.body;

      // Basic validation
      if (!schoolIdx || !schoolName || !adminName || !adminEmail || !password) {
        await session.abortTransaction();
        session.endSession();
        return res.status(422).json({ success: false, message: 'Missing required fields' });
      }
      if (!validator.isEmail(adminEmail)) {
        await session.abortTransaction();
        session.endSession();
        return res.status(422).json({ success: false, message: 'Invalid email' });
      }
      if (password.length < 8) {
        await session.abortTransaction();
        session.endSession();
        return res.status(422).json({ success: false, message: 'Password must be at least 8 characters' });
      }

      // Check schoolIdx uniqueness
      const existingSchool = await School.findOne({ schoolIdx }).session(session);
      if (existingSchool) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ success: false, message: 'schoolIdx already exists' });
      }

      // Check admin email uniqueness
      const existingUser = await User.findOne({ email: adminEmail }).session(session);
      if (existingUser) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }

      // Create school
      const school = await School.create([{ schoolIdx, name: schoolName, address }], { session });
      const schoolDoc = school[0];

      // Hash password
      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Create admin user; enforce single ADMIN per school for now (we'll check)
      // If at some point you want multiple admins, remove the check or add a flag.
      // (We already ensured no user with this email exists; this prevents duplicate admin by email.)
      const adminUser = await User.create(
        [
          {
            schoolId: schoolDoc._id,
            name: adminName,
            email: adminEmail.toLowerCase(),
            passwordHash,
            role: 'ADMIN',
            isActive: true,
          },
        ],
        { session }
      );

      // Create email verification token (one-time)
      const verificationToken = randomTokenString();
      const verificationTokenHash = await hashToken(verificationToken);
      // Save verification token as a short-lived refresh token-like document but flagged for verification
      const vtExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
      await RefreshToken.create(
        [
          {
            userId: adminUser[0]._id,
            tokenHash: verificationTokenHash,
            expiresAt: vtExpires,
            createdByIp: req.ip,
            // we can reuse fields - treat revoked=false as valid
          },
        ],
        { session }
      );

      await session.commitTransaction();
      session.endSession();

      // Send verification email (development: we also return token for your request.rest tests)
      const verifyUrl = `${APP_BASE_URL}/api/auth/verify-email?token=${verificationToken}&email=${encodeURIComponent(
        adminEmail.toLowerCase()
      )}`;

      await sendEmail({
        to: adminEmail,
        subject: 'Verify your email',
        text: `Please verify: ${verifyUrl}`,
        html: `<p>Please verify your email by clicking <a href="${verifyUrl}">here</a></p>`,
      });

      // Return admin profile and verification token for dev/testing
      return res.status(201).json({
        success: true,
        message: 'School and Admin created. Verification email sent.',
        data: {
          school: { id: schoolDoc._id, schoolIdx: schoolDoc.schoolIdx, name: schoolDoc.name },
          admin: { id: adminUser[0]._id, name: adminUser[0].name, email: adminUser[0].email, role: adminUser[0].role },
          // NOTE: verificationToken included only for dev/testing; remove in production.
          verificationToken,
        },
      });
    } catch (err) {
      await session.abortTransaction().catch(() => {});
      session.endSession();
      // Handle unique index errors more gracefully
      if (err && err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Conflict, duplicate key' });
      }
      next(err);
    }
  },

  // Email verification endpoint
  verifyEmail: async (req, res, next) => {
    try {
      const { token, email } = req.query;
      if (!token || !email) return res.status(400).json({ success: false, message: 'Missing token or email' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const tokenHash = await hashToken(token);
      const rt = await RefreshToken.findOne({ userId: user._id, tokenHash, expiresAt: { $gt: new Date() }, revoked: false });
      if (!rt) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

      // "Verify" by removing token and maybe setting a flag on user (we'll set isEmailVerified)
      user.isEmailVerified = true;
      await user.save();

      // revoke the token so it can't be used again
      rt.revoked = true;
      await rt.save();

      return res.json({ success: true, message: 'Email verified' });
    } catch (err) {
      next(err);
    }
  },

  // Login: return access token + refresh token (refresh token saved hashed in DB)
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(422).json({ success: false, message: 'Missing email or password' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      if (!user.isActive) return res.status(403).json({ success: false, message: 'Account disabled' });

      // Build tokens
      const accessToken = generateAccessToken(user);
      const refreshTokenPlain = randomTokenString();
      const refreshTokenHash = await hashToken(refreshTokenPlain);
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000);

      // Store hashed refresh token in DB
      await RefreshToken.create({
        userId: user._id,
        tokenHash: refreshTokenHash,
        expiresAt,
        createdByIp: req.ip,
      });

      // Set httpOnly cookie for refresh token (helpful for browsers). Also return refresh token in body for API testing (remove in prod).
      res.cookie('refreshToken', refreshTokenPlain, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000,
      });

      const userPayload = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        schoolId: user.schoolId,
      };

      return res.json({
        success: true,
        token: accessToken,
        refreshToken: refreshTokenPlain, // included for request.rest testing — remove in production if you store only cookie
        user: userPayload,
      });
    } catch (err) {
      next(err);
    }
  },

  // Rotate refresh token and return new access token + new refresh token
  refreshToken: async (req, res, next) => {
    try {
      // Refresh token can come from cookie or body
      const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!incoming) return res.status(401).json({ success: false, message: 'Refresh token missing' });

      const incomingHash = await hashToken(incoming);
      const stored = await RefreshToken.findOne({ tokenHash: incomingHash });

      if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        return res.status(401).json({ success: false, message: 'Invalid or expired refresh token' });
      }

      // Get user
      const user = await User.findById(stored.userId);
      if (!user) return res.status(401).json({ success: false, message: 'User not found' });

      // Rotate: revoke current, create new
      stored.revoked = true;
      const newPlain = randomTokenString();
      const newHash = await hashToken(newPlain);
      stored.replacedByTokenHash = newHash;
      await stored.save();

      const newExpires = new Date(Date.now() + REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000);
      await RefreshToken.create({
        userId: user._id,
        tokenHash: newHash,
        expiresAt: newExpires,
        createdByIp: req.ip,
      });

      const accessToken = generateAccessToken(user);

      // set new cookie
      res.cookie('refreshToken', newPlain, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000,
      });

      return res.json({ success: true, token: accessToken, refreshToken: newPlain });
    } catch (err) {
      next(err);
    }
  },

  // Logout: revoke refresh token if provided
  logout: async (req, res, next) => {
    try {
      const incoming = req.cookies?.refreshToken || req.body?.refreshToken;
      if (!incoming) {
        // clear cookie anyway
        res.clearCookie('refreshToken');
        return res.json({ success: true, message: 'Logged out' });
      }
      const incomingHash = await hashToken(incoming);
      const stored = await RefreshToken.findOne({ tokenHash: incomingHash });
      if (stored) {
        stored.revoked = true;
        await stored.save();
      }
      res.clearCookie('refreshToken');
      return res.json({ success: true, message: 'Logged out' });
    } catch (err) {
      next(err);
    }
  },

  // Request password reset: create a short-lived token and email it
  requestPasswordReset: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(422).json({ success: false, message: 'Email required' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // For privacy, respond OK
        return res.json({ success: true, message: 'If that user exists, a reset email was sent' });
      }

      const tokenPlain = randomTokenString();
      const tokenHash = await hashToken(tokenPlain);
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

      await RefreshToken.create({
        userId: user._id,
        tokenHash,
        expiresAt,
        createdByIp: req.ip,
      });

      const resetUrl = `${APP_BASE_URL}/api/auth/reset-password?token=${tokenPlain}&email=${encodeURIComponent(user.email)}`;

      await sendEmail({
        to: user.email,
        subject: 'Password Reset',
        text: `Reset: ${resetUrl}`,
        html: `<p>Reset your password: <a href="${resetUrl}">click here</a></p>`,
      });

      // For dev/testing return token so you can use it in request.rest (remove in prod)
      return res.json({ success: true, message: 'If that user exists, a reset email was sent', resetToken: tokenPlain });
    } catch (err) {
      next(err);
    }
  },

  // Reset password using token
  resetPassword: async (req, res, next) => {
    try {
      const { token, newPassword, email } = req.body;
      if (!token || !newPassword || !email) return res.status(422).json({ success: false, message: 'Missing required fields' });
      if (newPassword.length < 8) return res.status(422).json({ success: false, message: 'Password too short' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(404).json({ success: false, message: 'User not found' });

      const tokenHash = await hashToken(token);
      const rt = await RefreshToken.findOne({ userId: user._id, tokenHash, expiresAt: { $gt: new Date() }, revoked: false });
      if (!rt) return res.status(400).json({ success: false, message: 'Invalid or expired token' });

      user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

      // Invalidate all refresh tokens for user to force re-login
      await RefreshToken.updateMany({ userId: user._id }, { revoked: true });

      await user.save();

      rt.revoked = true;
      await rt.save();

      return res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
      next(err);
    }
  },
};
