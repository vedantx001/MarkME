const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'principal', 'admin'], required: true },
  schoolId: { type: Number, ref: "School", required: true },
  createdAt: { type: Date, default: Date.now }
});

// Virtual setter for password (hashing)
UserSchema.virtual('password').set(function (password) {
  const saltRounds = 10;
  this.passwordHash = bcrypt.hashSync(password, saltRounds);
});

// Verify password method
UserSchema.methods.verifyPassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
