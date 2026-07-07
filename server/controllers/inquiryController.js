// Stub for Inquiry Controller
const createInquiry = async (req, res, next) => {
  res.status(501).json({ message: 'Create inquiry route not implemented yet' });
};

const getInquiries = async (req, res, next) => {
  res.status(501).json({ message: 'Get inquiries route not implemented yet' });
};

const addMessageToInquiry = async (req, res, next) => {
  res.status(501).json({ message: 'Add message to inquiry route not implemented yet' });
};

module.exports = {
  createInquiry,
  getInquiries,
  addMessageToInquiry
};
