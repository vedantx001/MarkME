const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const EmbeddingSchema = new Schema({
    vector: { type: [Number] }, // e.g. 128 or 512-length float array
    normalized: { type: [Number] }, // optional: normalized vector (unit length) to speed cosine
    sourcePhotoId: { type: Schema.Types.ObjectId, ref: 'Photo' },
    qualityScore: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });


const StudentSchema = new Schema({
    classroomId: { type: Schema.Types.ObjectId, ref: 'Classroom', required: true },
    className: { type: String, ref: 'Classroom' },
    name: { type: String, required: true },
    rollNo: { type: Number, required: true },
    gender: {type:String, required: true},
    isActive: { type: Boolean, default: true },
    photoId: { type: Schema.Types.ObjectId, ref: 'Photo', required: true},
    embeddings: [EmbeddingSchema],
    meta: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});


// ensure unique roll number in a classroom
StudentSchema.index({ rollNo: 1 }, { unique: true });


module.exports = mongoose.model('Student', StudentSchema);