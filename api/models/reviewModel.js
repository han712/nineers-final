// models/reviewModel.js
import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  serviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

// Prevent duplicate reviews
reviewSchema.index({ gigId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);