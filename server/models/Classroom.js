const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const ClassroomSchema = new Schema({
    schoolId: { type: Schema.Types.ObjectId, ref: 'School', required: true, index: true },
    standard: { type: Number, required: true }, 
    division: { type: String, required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    meta: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});


// Ensure a teacher can't create duplicate classroom names within same school
ClassroomSchema.index({ schoolId: 1, standard: 1, division:1 }, { unique: true });


module.exports = mongoose.model('Classroom', ClassroomSchema);