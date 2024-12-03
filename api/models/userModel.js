import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [50, 'Full name cannot exceed 50 characters'],
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address',
      ],
    },
    password: {
      type: String,
      required: true,
      select: false, // Exclude password from default queries
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false, // Email verification status
    },
    isBanned: {
      type: Boolean,
      default: false, // Moderation control
    },
    profileImage: {
      url: {
        type: String,
        default: '/default-profile.png'
      },
      publicId: {
        type: String,
        default: null
      },
      uploadedAt: {
        type: Date,
        default: null
      }
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; // Exclude password from returned data
        return ret;
      },
    },
  }
);

// Add indexes for performance
userSchema.index({ email: 1, username: 1 });

// Pre-save middleware to hash passwords
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

const User = mongoose.model('User', userSchema);

export default User;
