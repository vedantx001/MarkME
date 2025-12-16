const { Schema, model } = require('mongoose');

/*
 * 2. User (Admin / Teacher / Principal)
 */
const USER_ROLES = ['ADMIN', 'TEACHER', 'PRINCIPAL'];

const userSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: USER_ROLES,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Unique index for email is already handled via the schema path's `unique: true`.
userSchema.index({ schoolId: 1, role: 1 });

const User = model('User', userSchema);

module.exports = User;