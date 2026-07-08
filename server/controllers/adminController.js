const mongoose = require('mongoose');
const Listing = require('../models/Listing');

// @desc    Get flagged listings queue (status is pending_review OR riskFlag is High)
// @route   GET /api/admin/flagged
// @access  Private (Admin only)
const getFlaggedListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const listings = await Listing.find({
      $or: [
        { status: 'pending_review' },
        { riskFlag: 'High' }
      ]
    })
      .populate('seller', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    next(error);
  }
};

// @desc    Approve listing (set status to active)
// @route   PUT /api/admin/listings/:id/approve
// @access  Private (Admin only)
const approveListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'active') {
      return res.status(400).json({ message: 'Listing is already active' });
    }

    listing.status = 'active';
    listing.rejectionReason = null;
    await listing.save();

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Reject listing (set status to rejected, with optional reason)
// @route   PUT /api/admin/listings/:id/reject
// @access  Private (Admin only)
const rejectListing = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    if (listing.status === 'rejected') {
      return res.status(400).json({ message: 'Listing is already rejected' });
    }

    const { reason } = req.body;
    listing.status = 'rejected';
    listing.rejectionReason = reason || null;
    await listing.save();

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings for admin oversight
// @route   GET /api/admin/listings
// @access  Private (Admin only)
const getAllListings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const listings = await Listing.find({})
      .populate('seller', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.json(listings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFlaggedListings,
  approveListing,
  rejectListing,
  getAllListings
};
