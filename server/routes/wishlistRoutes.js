const express = require('express');
const router = express.Router();
const { addWishlistItem, removeWishlistItem, getWishlist } = require('../controllers/wishlistController');
const { protect } = require('../middleware/auth');

// All routes here are protected
router.use(protect);

router.get('/', getWishlist);
router.post('/:listingId', addWishlistItem);
router.delete('/:listingId', removeWishlistItem);

module.exports = router;
