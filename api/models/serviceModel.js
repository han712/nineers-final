import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  imageSrc: { type: String, default: '' }, // Default to an empty string if no image is provided
  imageAlt: { type: String, default: '' },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  rating: { type: Number, required: true },
  category: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Service = mongoose.model('Service', serviceSchema);

export default Service;
