const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');

// @desc    Add listing to user's saved listings
// @route   POST /api/wishlist/:listingId
// @access  Private
const addWishlistItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(listingId);

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Check listing status
    if (listing.status !== 'active') {
      return res.status(400).json({ message: 'Only active listings can be wishlisted' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if already in wishlist
    if (user.savedListings.includes(listingId)) {
      return res.status(400).json({ message: 'Listing already in wishlist' });
    }

    user.savedListings.push(listingId);
    await user.save();

    res.status(200).json({
      message: 'Listing added to wishlist',
      savedListings: user.savedListings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove listing from user's saved listings
// @route   DELETE /api/wishlist/:listingId
// @access  Private
const removeWishlistItem = async (req, res, next) => {
  try {
    const { listingId } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Remove if present (idempotent)
    const initialLength = user.savedListings.length;
    user.savedListings = user.savedListings.filter(id => id.toString() !== listingId);

    if (user.savedListings.length !== initialLength) {
      await user.save();
    }

    res.status(200).json({
      message: 'Listing removed from wishlist',
      savedListings: user.savedListings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's saved listings (fully populated)
// @route   GET /api/wishlist
// @access  Private
const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'savedListings',
      populate: { path: 'seller', select: 'name' }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Filter out nulls (deleted listings)
    const validWishlist = user.savedListings.filter(item => item !== null);

    // Clean up dead references from database if any were found
    const rawSavedListings = user.populated('savedListings') || user.savedListings;
    if (rawSavedListings.length !== validWishlist.length) {
      await User.findByIdAndUpdate(req.user.id, {
        savedListings: validWishlist.map(item => item._id)
      });
    }

    res.status(200).json(validWishlist);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addWishlistItem,
  removeWishlistItem,
  getWishlist
};
