const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const validator = require('validator');

const School = require('../model/School');
const User = require('../model/User');
const RefreshToken = require('../model/RefreshToken');
const PendingAdminRegistration = require('../model/PendingAdminRegistration');

const sendMail = require("../utils/mailer");

const otpMail = require("../utils/emailTemplates/otpMail");
const welcomeMail = require("../utils/emailTemplates/welcomeMail");
const resetPasswordMail = require("../utils/emailTemplates/resetPasswordMail");

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXP = process.env.JWT_EXP || '7d'; // 7 days as requested
const REFRESH_TOKEN_EXP_DAYS = parseInt(process.env.REFRESH_TOKEN_EXP_DAYS || '30', 10);
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);
// Normalize client URL and strip trailing slashes to avoid double slashes in paths
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/+$/, '');

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

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

module.exports = {
  // register-admin: create a pending registration + send OTP.
  // IMPORTANT: do NOT create School/User in DB until OTP is verified.
  registerAdmin: async (req, res, next) => {
    try {
      const { schoolIdx, schoolName, address, adminName, adminEmail, password } = req.body;

      // Basic validation
      if (!schoolIdx || !schoolName || !adminName || !adminEmail || !password) {
        return res.status(422).json({ success: false, message: 'Missing required fields' });
      }
      if (!validator.isEmail(adminEmail)) {
        return res.status(422).json({ success: false, message: 'Invalid email' });
      }
      if (password.length < 8) {
        return res.status(422).json({ success: false, message: 'Password must be at least 8 characters' });
      }

      const normalizedEmail = adminEmail.toLowerCase();

      // Check schoolIdx uniqueness
      const existingSchool = await School.findOne({ schoolIdx });
      if (existingSchool) {
        return res.status(409).json({ success: false, message: 'schoolIdx already exists' });
      }

      // Check admin email uniqueness
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }

      // If there's an older pending registration for this email/schoolIdx, remove it.
      // This allows retrying registration if OTP email fails or expires.
      await PendingAdminRegistration.deleteMany({
        $or: [{ email: normalizedEmail }, { schoolIdx }],
      }).catch(() => {});

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      const otp = generateOtp();
      const otpHash = await hashOtp(otp);
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // cleanup window (TTL)

      // Create pending registration FIRST, then send email.
      // If email sending fails, we delete this record.
      await PendingAdminRegistration.create({
        email: normalizedEmail,
        schoolIdx,
        schoolName,
        address,
        adminName,
        passwordHash,
        otpHash,
        otpExpiresAt,
        expiresAt,
      });

      try {
        await sendMail({
          to: normalizedEmail,
          subject: 'MarkME | Verify your Email',
          html: otpMail(otp),
        });
      } catch (mailErr) {
        // IMPORTANT: log a sanitized summary so production logs show the exact SMTP failure reason.
        // Do not log credentials.
        try {
          console.error('[AUTH] Failed to send OTP email', {
            to: normalizedEmail,
            code: mailErr?.code,
            command: mailErr?.command,
            responseCode: mailErr?.responseCode,
            response: mailErr?.response,
            message: mailErr?.message,
          });
        } catch {
          // ignore logging failures
        }
        await PendingAdminRegistration.deleteOne({ email: normalizedEmail }).catch(() => {});
        return res.status(502).json({ success: false, message: 'Failed to send OTP email. Please try again.' });
      }

      return res.status(201).json({
        success: true,
        message: 'OTP sent to email for verification.',
        data: {
          email: normalizedEmail,
          schoolIdx,
        },
      });
    } catch (err) {
      // Handle unique index errors more gracefully
      if (err && err.code === 11000) {
        return res.status(409).json({ success: false, message: 'Conflict, duplicate key' });
      }
      next(err);
    }
  },

  // Email verification endpoint (DEPRECATED: old token-link flow). Keep for compatibility, but indicate not supported.
  verifyEmail: async (req, res) => {
    return res.status(410).json({
      success: false,
      message: 'Email-link verification is disabled. Please verify using OTP (/api/auth/verify-otp).',
    });
  },

  // Login: require verified email
  login: async (req, res, next) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(422).json({ success: false, message: 'Missing email or password' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      const match = await bcrypt.compare(password, user.passwordHash);
      if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

      if (!user.isActive) return res.status(403).json({ success: false, message: 'Account disabled' });

      // Only ADMIN is OTP-verified in the current product flow.
      // Teachers/Principals are usually provisioned by Admin and should be able to login without OTP.
      if (String(user.role).toUpperCase() === 'ADMIN' && !user.isVerified) {
        return res.status(403).json({ success: false, message: 'Please verify your email using OTP' });
      }

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

      const isProd = process.env.NODE_ENV === 'production';

      res.cookie('refreshToken', refreshTokenPlain, {
        httpOnly: true,
        // Required for cross-site cookies (Vercel -> Render). Browsers require SameSite=None to also be Secure.
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
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
        refreshToken: refreshTokenPlain,
        user: userPayload,
      });
    } catch (err) {
      next(err);
    }
  },

  // OTP: verify OTP.
  // - If a User exists: mark verified.
  // - Else if there's a PendingAdminRegistration: create School+Admin, then mark verified.
  verifyOtp: async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const { email, otp } = req.body;
      if (!email || !otp) {
        await session.abortTransaction();
        session.endSession();
        return res.status(422).json({ success: false, message: 'Email and OTP required' });
      }

      const normalizedEmail = email.toLowerCase();
      const hashedOtp = await hashOtp(otp);

      const user = await User.findOne({ email: normalizedEmail }).session(session);
      if (user) {
        if (!user.otpHash || user.otpHash !== hashedOtp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
          await session.abortTransaction();
          session.endSession();
          return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.isVerified = true;
        user.otpHash = undefined;
        user.otpExpiresAt = undefined;
        await user.save({ session });

        await session.commitTransaction();
        session.endSession();

        // Best-effort: user verification should not fail if SMTP is down.
        try {
          await sendMail({
            to: user.email,
            subject: 'Welcome to MarkME',
            html: welcomeMail(user.name),
          });
        } catch (mailErr) {
          try {
            console.warn('[AUTH] Failed to send welcome email after OTP verification', {
              to: user.email,
              code: mailErr?.code,
              command: mailErr?.command,
              responseCode: mailErr?.responseCode,
              response: mailErr?.response,
              message: mailErr?.message,
            });
          } catch {
            // ignore logging failures
          }
        }

        return res.json({ success: true, message: 'Account verified' });
      }

      // Otherwise, complete a pending admin registration
      const pending = await PendingAdminRegistration.findOne({ email: normalizedEmail }).session(session);
      if (!pending) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Invalid user' });
      }

      if (!pending.otpHash || pending.otpHash !== hashedOtp || !pending.otpExpiresAt || pending.otpExpiresAt < new Date()) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Re-check uniqueness at verification time (race-safe)
      const schoolExists = await School.findOne({ schoolIdx: pending.schoolIdx }).session(session);
      if (schoolExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ success: false, message: 'schoolIdx already exists' });
      }
      const userExists = await User.findOne({ email: normalizedEmail }).session(session);
      if (userExists) {
        await session.abortTransaction();
        session.endSession();
        return res.status(409).json({ success: false, message: 'Email already in use' });
      }

      const school = await School.create(
        [{ schoolIdx: pending.schoolIdx, name: pending.schoolName, address: pending.address }],
        { session }
      );
      const schoolDoc = school[0];

      const created = await User.create(
        [
          {
            schoolId: schoolDoc._id,
            name: pending.adminName,
            email: normalizedEmail,
            passwordHash: pending.passwordHash,
            role: 'ADMIN',
            isActive: true,
            isVerified: true,
          },
        ],
        { session }
      );

      await PendingAdminRegistration.deleteOne({ _id: pending._id }).session(session);

      await session.commitTransaction();
      session.endSession();

      // Best-effort: account verification + auto-login should not be blocked by SMTP failures.
      try {
        await sendMail({
          to: normalizedEmail,
          subject: 'Welcome to MarkME',
          html: welcomeMail(pending.adminName),
        });
      } catch (mailErr) {
        try {
          console.warn('[AUTH] Failed to send welcome email after OTP verification', {
            to: normalizedEmail,
            code: mailErr?.code,
            command: mailErr?.command,
            responseCode: mailErr?.responseCode,
            response: mailErr?.response,
            message: mailErr?.message,
          });
        } catch {
          // ignore logging failures
        }
      }

      // ✅ Auto-login newly verified admin
      const newAdmin = created[0];
      const accessToken = generateAccessToken(newAdmin);
      const refreshTokenPlain = randomTokenString();
      const refreshTokenHash = await hashToken(refreshTokenPlain);
      const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000);

      await RefreshToken.create({
        userId: newAdmin._id,
        tokenHash: refreshTokenHash,
        expiresAt,
        createdByIp: req.ip,
      });

      const isProd = process.env.NODE_ENV === 'production';
      res.cookie('refreshToken', refreshTokenPlain, {
        httpOnly: true,
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
        maxAge: REFRESH_TOKEN_EXP_DAYS * 24 * 60 * 60 * 1000,
      });

      return res.json({
        success: true,
        message: 'Account verified',
        token: accessToken,
        refreshToken: refreshTokenPlain,
        user: {
          id: newAdmin._id,
          name: newAdmin.name,
          email: newAdmin.email,
          role: newAdmin.role,
          schoolId: newAdmin.schoolId,
        },
        data: {
          school: { id: schoolDoc._id, schoolIdx: schoolDoc.schoolIdx, name: schoolDoc.name },
          admin: { id: newAdmin._id, name: newAdmin.name, email: newAdmin.email, role: newAdmin.role },
        },
      });
    } catch (err) {
      await session.abortTransaction().catch(() => {});
      session.endSession();
      next(err);
    }
  },

  /*
   * NOTE:
   * The legacy controller previously had a duplicated `login` implementation below this point.
   * That duplicate enforced `isVerified` for ALL roles and was causing TEACHER/PRINCIPAL logins
   * to fail with 403, eventually redirecting to /errors/403 in the client.
   *
   * We intentionally keep ONLY the single `login` above (ADMIN requires OTP; others can login).
   */

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

      const isProd = process.env.NODE_ENV === 'production';

      // set new cookie
      res.cookie('refreshToken', newPlain, {
        httpOnly: true,
        // Required for cross-site cookies (Vercel -> Render). Browsers require SameSite=None to also be Secure.
        sameSite: isProd ? 'none' : 'lax',
        secure: isProd,
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

      const resetUrl = `${CLIENT_URL}/api/auth/reset-password?token=${tokenPlain}&email=${encodeURIComponent(user.email)}`;

      await sendMail({
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

  // OTP: send OTP for email verification.
  // Works for both existing Users and PendingAdminRegistration.
  sendOtp: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(422).json({ success: false, message: 'Email required' });
      if (!validator.isEmail(email)) return res.status(422).json({ success: false, message: 'Invalid email' });

      const normalizedEmail = email.toLowerCase();
      const otp = generateOtp();
      const otpHash = await hashOtp(otp);
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        user.otpHash = otpHash;
        user.otpExpiresAt = otpExpiresAt;
        user.isVerified = false;
        await user.save();
      } else {
        const pending = await PendingAdminRegistration.findOne({ email: normalizedEmail });
        if (!pending) return res.status(400).json({ success: false, message: 'Invalid user' });

        pending.otpHash = otpHash;
        pending.otpExpiresAt = otpExpiresAt;
        pending.expiresAt = new Date(Date.now() + 30 * 60 * 1000);
        await pending.save();
      }

      await sendMail({
        to: normalizedEmail,
        subject: 'MarkME | Verify your Email',
        html: otpMail(otp),
      });

      return res.status(200).json({ success: true, message: 'OTP sent to email' });
    } catch (err) {
      next(err);
    }
  },

  // Forgot password: create reset token on User model (passwordResetToken/passwordResetExpires)
  forgotPassword: async (req, res, next) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(422).json({ success: false, message: 'Email required' });

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        // privacy
        return res.json({ success: true, message: 'If email exists, reset link sent' });
      }

      const token = crypto.randomBytes(32).toString('hex');
      user.passwordResetToken = await hashToken(token);
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      await user.save();

      const resetLink = `${CLIENT_URL}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

      await sendMail({
        to: user.email,
        subject: 'MarkME | Reset Password',
        html: resetPasswordMail(resetLink),
      });

      return res.json({ success: true, message: 'Reset link sent' });
    } catch (err) {
      next(err);
    }
  },

  // Reset password: verify token from User model and update passwordHash
  resetPasswordWithUserToken: async (req, res, next) => {
    try {
      const { token, password, email } = req.body;
      if (!token || !password) return res.status(422).json({ success: false, message: 'Token and password required' });
      if (password.length < 8) return res.status(422).json({ success: false, message: 'Password must be at least 8 characters' });

      const hashedToken = await hashToken(token);

      const query = {
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: new Date() },
      };
      if (email) query.email = email.toLowerCase();

      const user = await User.findOne(query);

      if (!user) return res.status(400).json({ success: false, message: 'Token invalid or expired' });

      user.passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      // also revoke refresh tokens (if you use them) as a safety measure
      await RefreshToken.updateMany({ userId: user._id }, { revoked: true }).catch(() => {});

      return res.json({ success: true, message: 'Password reset successful' });
    } catch (err) {
      next(err);
    }
  },
};
