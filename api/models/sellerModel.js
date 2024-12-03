import mongoose from 'mongoose';

const sellerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Professional title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    minlength: [20, 'Description must be at least 20 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  skills: {
    type: [{
      type: String,
      trim: true,
      minlength: [2, 'Skill must be at least 2 characters'],
      maxlength: [30, 'Skill cannot exceed 30 characters']
    }],
    required: [true, 'At least one skill is required'],
    validate: {
      validator: function(array) {
        return array && array.length > 0;
      },
      message: 'At least one skill is required'
    }
  },
  languages: {
    type: [{
      type: String,
      trim: true,
      minlength: [2, 'Language must be at least 2 characters'],
      maxlength: [30, 'Language cannot exceed 30 characters']
    }],
    default: [],
    validate: {
      validator: function(array) {
        return array.length <= 10;
      },
      message: 'Cannot specify more than 10 languages'
    }
  },
  hourlyRate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: [1, 'Hourly rate must be at least 1'],
    max: [1000, 'Hourly rate cannot exceed 1000']
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  completedJobs: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient queries
sellerSchema.index({ userId: 1 });
sellerSchema.index({ skills: 1 });
sellerSchema.index({ hourlyRate: 1 });
sellerSchema.index({ 'rating.average': -1 });
sellerSchema.index({ isAvailable: 1 });

// Virtual populate for user information
sellerSchema.virtual('user', {
  ref: 'User',
  localField: 'userId',
  foreignField: '_id',
  justOne: true
});

// Method to update rating
sellerSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
};

// Method to update earnings
sellerSchema.methods.updateEarnings = function(amount) {
  this.earnings += amount;
  this.completedJobs += 1;
};

// Pre-save middleware to ensure valid data
sellerSchema.pre('save', function(next) {
  // Remove duplicate skills
  if (this.skills) {
    this.skills = [...new Set(this.skills)];
  }
  
  // Remove duplicate languages
  if (this.languages) {
    this.languages = [...new Set(this.languages)];
  }
  
  next();
});

const Seller = mongoose.model('Seller', sellerSchema);

export default Seller;