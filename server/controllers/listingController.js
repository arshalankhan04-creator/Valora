// Stub for Listing Controller
const createListing = async (req, res, next) => {
  res.status(501).json({ message: 'Create listing route not implemented yet' });
};

const getListings = async (req, res, next) => {
  res.status(501).json({ message: 'Get listings route not implemented yet' });
};

const getListingById = async (req, res, next) => {
  res.status(501).json({ message: 'Get listing by ID route not implemented yet' });
};

const updateListing = async (req, res, next) => {
  res.status(501).json({ message: 'Update listing route not implemented yet' });
};

const deleteListing = async (req, res, next) => {
  res.status(501).json({ message: 'Delete listing route not implemented yet' });
};

module.exports = {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing
};
