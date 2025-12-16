const { Schema, model } = require('mongoose');

/*
 * 6. AttendanceSession (per class per day)
 */
const SESSION_STATUS = ['PENDING', 'IN_REVIEW', 'FINALIZED'];

const attendanceSessionSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Classroom',
      required: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      // normalize to start-of-day (optional but handy)
      set: (value) => {
        const d = new Date(value);
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
      },
    },
    status: {
      type: String,
      enum: SESSION_STATUS,
      default: 'PENDING',
    },
  },
  { timestamps: true }
);

// 1 session per class per date
attendanceSessionSchema.index(
  { classId: 1, date: 1 },
  { unique: true }
);
attendanceSessionSchema.index({ teacherId: 1, date: 1 });

const AttendanceSession = model(
  'AttendanceSession',
  attendanceSessionSchema
);

module.exports = AttendanceSession;