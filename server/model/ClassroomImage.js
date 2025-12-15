const mongoose = require('mongoose');
const { Schema, model } = mongoose;

/*
 * 7. ClassroomImage (images used for a session)
 */
const classroomImageSchema = new Schema(
  {
    sessionId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceSession',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    capturedAt: {
      type: Date,
      default: Date.now,
    },
    meta: {
      width: Number,
      height: Number,
      deviceInfo: String,
    },
  },
  { timestamps: true }
);

classroomImageSchema.index({ sessionId: 1 });

const ClassroomImage = model('ClassroomImage', classroomImageSchema);
module.exports = ClassroomImage;