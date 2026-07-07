const express = require('express');
const router = express.Router();
const {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing
} = require('../controllers/listingController');

// Placeholder routes
router.route('/')
  .post(createListing)
  .get(getListings);

router.route('/:id')
  .get(getListingById)
  .put(updateListing)
  .delete(deleteListing);

module.exports = router;
