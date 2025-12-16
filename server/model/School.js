const { Schema, model } = require('mongoose');


/*
 * 1. School
 */
const schoolSchema = new Schema(
  {
    schoolIdx: {
      type: String,
      required: true,
      unique: true,          // external code / identifier
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
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
const School = model('School', schoolSchema);

module.exports = School;    