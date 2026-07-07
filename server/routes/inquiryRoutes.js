const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  addMessageToInquiry
} = require('../controllers/inquiryController');

// Placeholder routes
router.route('/')
  .post(createInquiry)
  .get(getInquiries);

router.route('/:id/messages')
  .post(addMessageToInquiry);

module.exports = router;
