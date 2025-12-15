<<<<<<< HEAD
const mongoose = require('mongoose');
const { Schema, model } = mongoose;
=======
const { Schema, model } = require('mongoose');
>>>>>>> origin/feature/attendance-sessions

/*
 * 3. Class (Classroom)
 */
const classSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    educationalYear: {
      type: String,          // e.g. "2025-2026"
      required: true,
      trim: true,
    },
    std: {
      type: String,          // e.g. "8"
      required: true,
      trim: true,
    },
    division: {
      type: String,          // e.g. "A"
      required: true,
      trim: true,
    },
    classTeacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',          // role must be TEACHER (enforced in service)
      required: true,
    },
    name: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// 1 class per school-year-std-division
classSchema.index(
  { schoolId: 1, educationalYear: 1, std: 1, division: 1 },
  { unique: true }
);
classSchema.index({ classTeacherId: 1 });

const Classroom = model('Classroom', classSchema);

module.exports = Classroom;