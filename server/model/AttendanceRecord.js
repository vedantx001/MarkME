const mongoose = require('mongoose');
const { Schema, model } = mongoose;

/*
 * 8. AttendanceRecord (per student per session)
 */
const ATTENDANCE_STATUS = ['P', 'A'];
const ATTENDANCE_SOURCE = ['SYSTEM', 'TEACHER'];

const attendanceRecordSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    status: {
      type: String,
      enum: ATTENDANCE_STATUS,
      required: true,
    },
    source: {
      type: String,
      enum: ATTENDANCE_SOURCE,
      default: 'SYSTEM',
    },
    confidence: {
      type: Number, // 0–1 for system, null for teacher edits
    },
    edited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// 1 record per student per session
attendanceRecordSchema.index(
  { sessionId: 1, studentId: 1 },
  { unique: true }
);
attendanceRecordSchema.index({ studentId: 1 });
attendanceRecordSchema.index({ sessionId: 1 });

const AttendanceRecord = model('AttendanceRecord', attendanceRecordSchema);

module.exports = AttendanceRecord;