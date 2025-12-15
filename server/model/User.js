<<<<<<< HEAD
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
<<<<<<< HEAD
=======

>>>>>>> origin/feature/classes
=======
const { Schema, model } = require('mongoose');

>>>>>>> origin/feature/attendance-sessions
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
<<<<<<< HEAD

=======
// Unique index for email is already handled via the schema path's `unique: true`.
>>>>>>> origin/feature/attendance-sessions
userSchema.index({ schoolId: 1, role: 1 });

const User = model('User', userSchema);

module.exports = User;