const { Schema, model } = require('mongoose');

/*
 * Stores admin registration payload until OTP verification succeeds.
 * This ensures we do NOT create a User/School record before verification.
 */
const pendingAdminRegistrationSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    schoolIdx: {
      type: String,
      required: true,
      trim: true,
    },
    schoolName: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    otpExpiresAt: {
      type: Date,
      required: true,
    },
    // TTL cleanup target (Mongo deletes after this date)
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending registrations for same email / schoolIdx.
pendingAdminRegistrationSchema.index({ email: 1 }, { unique: true });
pendingAdminRegistrationSchema.index({ schoolIdx: 1 }, { unique: true });

module.exports = model('PendingAdminRegistration', pendingAdminRegistrationSchema);
