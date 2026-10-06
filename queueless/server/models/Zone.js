import mongoose from 'mongoose';

const zoneSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    currentToken: {
      type: Number,
      default: 0,
    },
    lastTokenGiven: {
      type: Number,
      default: 0,
    },
    avgTimePerPerson: {
      type: Number,
      default: 2,
    },
  },
  {
    timestamps: true,
  }
);

const Zone = mongoose.model('Zone', zoneSchema);

export default Zone;
