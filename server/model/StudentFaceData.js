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
 * 5. StudentFaceData (optional, for embeddings)
 */
const studentFaceDataSchema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'Student',
      required: true,
    },
    embedding: {
      type: [Number],         // vector
      required: true,
    },
    modelVersion: {
      type: String,           // e.g. "facenet-v1"
      required: true,
    },
  },
  { timestamps: true }
);

studentFaceDataSchema.index({ studentId: 1 });

const StudentFaceData = model('StudentFaceData', studentFaceDataSchema);

module.exports = StudentFaceData;