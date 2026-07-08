const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const Listing = require('../models/Listing');

// @desc    Create new inquiry thread or append message to existing thread
// @route   POST /api/inquiries
// @access  Private (Buyers & Sellers acting as buyers on others' listings)
const createInquiry = async (req, res, next) => {
  try {
    const { listingId, text } = req.body;

    // Validate inputs
    if (!listingId || !text) {
      return res.status(400).json({ message: 'Please provide listing ID and message text' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(listingId)) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found' });
    }

    // Prevent seller from inquiring on their own listing
    if (listing.seller.toString() === req.user.id) {
      return res.status(400).json({ message: 'You cannot inquire about your own listing' });
    }

    // Check if an inquiry thread already exists for this listing + buyer
    let inquiry = await Inquiry.findOne({ buyer: req.user.id, listing: listingId });

    if (inquiry) {
      // Append message to existing thread
      inquiry.messages.push({
        sender: req.user.id,
        text
      });
      await inquiry.save();
      return res.status(200).json(inquiry);
    }

    // Create new thread
    inquiry = await Inquiry.create({
      listing: listingId,
      buyer: req.user.id,
      seller: listing.seller,
      messages: [{
        sender: req.user.id,
        text
      }]
    });

    res.status(201).json(inquiry);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's inquiry threads (role-aware)
// @route   GET /api/inquiries/mine
// @access  Private
const getInquiries = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role === 'buyer') {
      query.buyer = req.user.id;
    } else if (req.user.role === 'seller') {
      query.seller = req.user.id;
    } else {
      // Fallback/Admin: return where they are either buyer or seller
      query.$or = [{ buyer: req.user.id }, { seller: req.user.id }];
    }

    const inquiries = await Inquiry.find(query)
      .populate('listing', 'brand model')
      .populate('buyer', 'name')
      .populate('seller', 'name')
      .sort({ updatedAt: -1 });

    res.json(inquiries);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single inquiry thread by ID
// @route   GET /api/inquiries/:id
// @access  Private (Thread participants only)
const getInquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Inquiry thread not found' });
    }

    const inquiry = await Inquiry.findById(id)
      .populate('listing', 'brand model')
      .populate('buyer', 'name')
      .populate('seller', 'name')
      .populate('messages.sender', 'name');

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry thread not found' });
    }

    // Access check: only thread buyer or seller can view
    const isBuyer = inquiry.buyer._id.toString() === req.user.id;
    const isSeller = inquiry.seller._id.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to view this inquiry thread' });
    }

    res.json(inquiry);
  } catch (error) {
    next(error);
  }
};

// @desc    Append message to an existing inquiry thread
// @route   POST /api/inquiries/:id/messages
// @access  Private (Thread participants only)
const addMessageToInquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: 'Please provide message text' });
    }

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Inquiry thread not found' });
    }

    const inquiry = await Inquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry thread not found' });
    }

    // Access check: only thread buyer or seller can send message
    const isBuyer = inquiry.buyer.toString() === req.user.id;
    const isSeller = inquiry.seller.toString() === req.user.id;

    if (!isBuyer && !isSeller) {
      return res.status(403).json({ message: 'Not authorized to send messages on this thread' });
    }

    inquiry.messages.push({
      sender: req.user.id,
      text
    });

    await inquiry.save();
    res.status(200).json(inquiry);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createInquiry,
  getInquiries,
  getInquiryById,
  addMessageToInquiry
};
