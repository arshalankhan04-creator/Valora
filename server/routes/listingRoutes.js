const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
  addListingImages,
  deleteListingImage
} = require('../controllers/listingController');
const { protect } = require('../middleware/auth');
const { restrictTo } = require('../middleware/role');
const { uploadImages } = require('../middleware/upload');

// Public route for searching/getting all listings
router.get('/', getListings);

// Protected route for getting own listings (must be defined BEFORE /:id)
router.get('/mine', protect, restrictTo('seller'), getMyListings);

// Public route for getting listing by ID
router.get('/:id', getListingById);

// Protected routes (require login and 'seller' role for creation)
router.post('/', protect, restrictTo('seller'), uploadImages, createListing);

// Protected routes (require ownership check in controller)
router.put('/:id', protect, updateListing);
router.delete('/:id', protect, deleteListing);

// Image uploading / deleting endpoints (require ownership check in controller)
router.post('/:id/images', protect, uploadImages, addListingImages);
router.delete('/:id/images/:imageIndex', protect, deleteListingImage);

module.exports = router;
