// Stub for role-based authorization guard
const authorize = (...roles) => {
  return (req, res, next) => {
    // To be implemented in the auth phase
    next();
  };
};

module.exports = { authorize };
