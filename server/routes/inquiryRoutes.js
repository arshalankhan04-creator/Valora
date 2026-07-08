const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  getInquiryById,
  addMessageToInquiry
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/auth');

// All routes in this router require authentication
router.use(protect);

// GET /mine (must be defined BEFORE /:id)
router.get('/mine', getInquiries);

// GET /:id and POST /
router.route('/')
  .post(createInquiry);

router.route('/:id')
  .get(getInquiryById);

router.route('/:id/messages')
  .post(addMessageToInquiry);

module.exports = router;
