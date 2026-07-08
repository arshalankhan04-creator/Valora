const mongoose = require('mongoose');
const Listing = require('../models/Listing');

// @desc    Create a new listing
// @route   POST /api/listings
// @access  Private (Seller only)
const createListing = async (req, res, next) => {
  try {
    const {
      brand,
      model,
      year,
      kmDriven,
      fuelType,
      transmission,
      price,
      description
    } = req.body;

    // Validate required fields
    if (!brand || !model || !year || !kmDriven || !fuelType || !transmission || price === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate enums
    if (!['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].includes(fuelType)) {
      return res.status(400).json({ message: 'Invalid fuel type' });
    }

    if (!['Manual', 'Automatic'].includes(transmission)) {
      return res.status(400).json({ message: 'Invalid transmission type' });
    }

    const listing = await Listing.create({
      seller: req.user.id,
      brand,
      model,
      year,
      kmDriven,
      fuelType,
      transmission,
      price,
      description
    });

    res.status(201).json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all listings (with search, filter, sort)
// @route   GET /api/listings
// @access  Public
const getListings = async (req, res, next) => {
  try {
    const queryObj = {};

    // Filtering
    if (req.query.brand) {
      queryObj.brand = { $regex: req.query.brand, $options: 'i' };
    }
    if (req.query.year) {
      queryObj.year = Number(req.query.year);
    }
    if (req.query.fuelType) {
      queryObj.fuelType = req.query.fuelType;
    }
    
    // Price range filtering
    if (req.query.minPrice || req.query.maxPrice) {
      queryObj.price = {};
      if (req.query.minPrice) {
        queryObj.price.$gte = Number(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        queryObj.price.$lte = Number(req.query.maxPrice);
      }
    }

    // By default, public GET listings should show active listings
    queryObj.status = 'active';

    let query = Listing.find(queryObj);

    // Sorting
    if (req.query.sort === 'trustScore') {
      query = query.sort({ trustScore: -1, createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const listings = await query.populate('seller', 'name');
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single listing
// @route   GET /api/listings/:id
// @access  Public
const getListingById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(id).populate('seller', 'name');

    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    res.json(listing);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a listing
// @route   PUT /api/listings/:id
// @access  Private (Owner only)
const updateListing = async (req, res, next) => {
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

    // Ownership check
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this listing' });
    }

    const {
      brand,
      model,
      year,
      kmDriven,
      fuelType,
      transmission,
      price,
      description,
      status
    } = req.body;

    // Update fields if provided
    if (brand) listing.brand = brand;
    if (model) listing.model = model;
    if (year) listing.year = year;
    if (kmDriven) listing.kmDriven = kmDriven;
    if (fuelType) {
      if (!['Petrol', 'Diesel', 'Electric', 'CNG', 'Hybrid'].includes(fuelType)) {
        return res.status(400).json({ message: 'Invalid fuel type' });
      }
      listing.fuelType = fuelType;
    }
    if (transmission) {
      if (!['Manual', 'Automatic'].includes(transmission)) {
        return res.status(400).json({ message: 'Invalid transmission type' });
      }
      listing.transmission = transmission;
    }
    if (price !== undefined) listing.price = price;
    if (description !== undefined) listing.description = description;
    if (status) {
      if (!['active', 'pending_review', 'sold', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status value' });
      }
      listing.status = status;
    }

    const updatedListing = await listing.save();
    res.json(updatedListing);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a listing
// @route   DELETE /api/listings/:id
// @access  Private (Owner only)
const deleteListing = async (req, res, next) => {
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

    // Ownership check
    if (listing.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this listing' });
    }

    await Listing.findByIdAndDelete(id);
    res.json({ message: 'Listing removed' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in seller's listings
// @route   GET /api/listings/mine
// @access  Private (Seller only)
const getMyListings = async (req, res, next) => {
  try {
    const listings = await Listing.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings
};
