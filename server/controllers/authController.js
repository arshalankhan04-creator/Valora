// Stub for Auth Controller
const registerUser = async (req, res, next) => {
  res.status(501).json({ message: 'Register route not implemented yet' });
};

const loginUser = async (req, res, next) => {
  res.status(501).json({ message: 'Login route not implemented yet' });
};

const getUserProfile = async (req, res, next) => {
  res.status(501).json({ message: 'Get Profile route not implemented yet' });
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile
};
