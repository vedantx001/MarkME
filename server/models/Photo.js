const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const PhotoSchema = new Schema({
    ownerType: { type: String, enum: ['student', 'classroom'] },
    ownerId: { type: Schema.Types.ObjectId },
    storage: { type: String, enum: ['local', 's3'], default: 'local' },
    path: { type: String }, // path or key
    url: { type: String },
    createdAt: { type: Date, default: Date.now },
    }, 
    {
        timestamps: true    
    });


module.exports = mongoose.model('Photo', PhotoSchema);