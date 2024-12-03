import mongoose from "mongoose";

const GigSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // The user who created the gig
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 10, // Ensure the title is descriptive
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      minlength: 20, // A short description of the service
      maxlength: 1000,
    },
    category: {
      type: String,
      required: true, // E.g., "Design", "Programming", "Writing"
      enum: ["Design", "Programming", "Writing", "Marketing", "Video", "Music"],
    },
    price: {
      type: Number,
      required: true, // Cost of the gig
    },
    deliveryTime: {
      type: Number,
      required: true, // Delivery time in days
      min: 1, // Minimum delivery time
    },
    imageUrl: {
      type: String,
      required: true, // URL for the gig's display image
    },
    rating: {
      type: Number,
      default: 0, // Default rating
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0, // Count of total reviews for the gig
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active", // Whether the gig is active or inactive
    },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);

const Gig = mongoose.model("Gig", GigSchema);

export default Gig;
