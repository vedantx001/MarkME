const mongoose = require('mongoose');
const { Schema, model } = mongoose;

const refreshTokenSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tokenHash: { type: String, required: true }, // store hashed token
    expiresAt: { type: Date, required: true },
    createdByIp: String,
    revoked: { type: Boolean, default: false },
    replacedByTokenHash: String,
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1 });
refreshTokenSchema.index({ tokenHash: 1 });

module.exports = model('RefreshToken', refreshTokenSchema);
