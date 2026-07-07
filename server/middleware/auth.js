// Stub for JWT verification middleware
const protect = async (req, res, next) => {
  // To be implemented in the auth phase
  next();
};

module.exports = { protect };
