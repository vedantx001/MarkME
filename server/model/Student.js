const { Schema, model } = require('mongoose');

/*
 * 4. Student
 */
const studentSchema = new Schema(
  {
    schoolId: {
      type: Schema.Types.ObjectId,
      ref: 'School',
      required: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    rollNumber: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ['M', 'F', 'OTHER'],
    },
    profileImageUrl: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// rollNumber unique inside a class
studentSchema.index(
  { classId: 1, rollNumber: 1 },
  { unique: true }
);
studentSchema.index({ schoolId: 1, classId: 1 });

const Student = model('Student', studentSchema);
module.exports = Student;