const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StudentSchema = new Schema({
  classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
  className: { type: String, required: true }, // e.g., "6A"
  name: { type: String, required: true },
  rollNo: { type: Number, required: true },
  gender: { type: String, required: true },
  photoId: { type: Schema.Types.ObjectId, ref: 'Photo' },
  isActive: { type: Boolean, default: true },
  meta: { type: Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

// Ensure rollNo is unique per classroom
StudentSchema.index({ classroomId: 1, rollNo: 1 }, { unique: true });

module.exports = mongoose.model('Student', StudentSchema);
