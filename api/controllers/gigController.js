import Gig from '../models/gigModel.js';
import { createError } from '../utils/createError.js';
import asyncHandler from '../middleware/asyncHandler.js';


// Create a new gig
const createGig = asyncHandler(async (req, res) => {
  if (!req.isSeller) {
    throw createError(403, 'Only sellers can create gigs');
  }

  const gig = await Gig.create({
    userId: req.userId,
    ...req.body,
  });

  res.status(201).json({
    success: true,
    data: gig,
  });
})

const gigController = {
  createGig: asyncHandler(async (req, res) => {
    if (!req.isSeller) {
      throw createError(403, 'Only sellers can create gigs');
    }

    const gig = await Gig.create({
      userId: req.userId,
      ...req.body,
    });

    res.status(201).json({
      success: true,
      data: gig,
    });
  }),

  // Get all gigs with filters, search, and pagination
  getGigs: asyncHandler(async (req, res) => {
    const {
      userId,
      category,
      minPrice,
      maxPrice,
      search,
      sort,
      page = 1,
      limit = 10,
    } = req.query;

    // Build filter object
    const filters = {
      ...(userId && { userId }),
      ...(category && { category }),
      ...((minPrice || maxPrice) && {
        price: {
          ...(minPrice && { $gte: Number(minPrice) }),
          ...(maxPrice && { $lte: Number(maxPrice) }),
        },
      }),
      ...(search && { 
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      }),
    };

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Build sort object
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      priceAsc: { price: 1 },
      priceDesc: { price: -1 },
    };

    const gigs = await Gig.find(filters)
      .sort(sortOptions[sort] || sortOptions.newest)
      .skip(skip)
      .limit(Number(limit));

    const total = await Gig.countDocuments(filters);

    res.status(200).json({
      success: true,
      data: gigs,
      pagination: {
        current: Number(page),
        total: Math.ceil(total / Number(limit)),
        count: gigs.length,
        totalResults: total,
      },
    });
  }),

  // Get single gig by ID
  getGig: asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id)
      .populate('userId', 'username email rating')
      .populate('reviews');

    if (!gig) {
      throw createError(404, 'Gig not found');
    }

    res.status(200).json({
      success: true,
      data: gig,
    });
  }),

  // Update gig
  updateGig: asyncHandler(async (req, res) => {
    let gig = await Gig.findById(req.params.id);

    if (!gig) {
      throw createError(404, 'Gig not found');
    }

    // Check if user owns the gig
    if (gig.userId.toString() !== req.userId) {
      throw createError(403, 'You can only update your own gigs');
    }

    gig = await Gig.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: gig,
    });
  }),

  // Delete gig
  deleteGig: asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      throw createError(404, 'Gig not found');
    }

    // Check if user owns the gig
    if (gig.userId.toString() !== req.userId) {
      throw createError(403, 'You can only delete your own gigs');
    }

    await gig.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Gig deleted successfully',
    });
  }),

  // Get seller's gigs
  getSellerGigs: asyncHandler(async (req, res) => {
    const gigs = await Gig.find({ userId: req.params.userId })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: gigs,
    });
  }),

  // Toggle gig active status
  toggleGigStatus: asyncHandler(async (req, res) => {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      throw createError(404, 'Gig not found');
    }

    if (gig.userId.toString() !== req.userId) {
      throw createError(403, 'You can only update your own gigs');
    }

    gig.isActive = !gig.isActive;
    await gig.save();

    res.status(200).json({
      success: true,
      data: gig,
    });
  }),
};

export default gigController;