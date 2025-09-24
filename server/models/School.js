const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const SchoolSchema = new Schema({
    schoolId: { type: Number, required: true, unique: true, index: true, min: 10000, max: 99999 },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, index: true },
    address: { type: String },
    contactPhone: { type: String },
    meta: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
});


module.exports = mongoose.model('School', SchoolSchema);