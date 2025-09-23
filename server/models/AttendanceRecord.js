const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const AttendanceEntrySchema = new Schema({
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    status: { type: String, enum: ['present', 'absent'], required: true },
    matchedEmbeddingId: { type: Schema.Types.ObjectId },
}, { _id: true });


const AttendanceRecordSchema = new Schema({
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true, index: true },
    date: { type: Date, required: true, index: true },
    entries: [AttendanceEntrySchema],
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now }
});


// ensure only one attendance record per classroom/date
AttendanceRecordSchema.index({ classroomId: 1, date: 1}, { unique: true });


module.exports = mongoose.model('AttendanceRecord', AttendanceRecordSchema);