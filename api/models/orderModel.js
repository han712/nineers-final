// models/orderModel.js
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  gigId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Gig',
    required: true,
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  requirements: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'cancelled'],
    default: 'pending',
  },
  deliveryTime: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);