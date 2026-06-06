const asyncHandler = require('../utils/asyncHandler');

// @desc    Get current logged-in user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  // req.user contains the decoded token payload { id, email }
  res.status(200).json({
    success: true,
    message: 'User profile retrieved successfully',
    user: {
      id: req.user.id,
      email: req.user.email,
      role: req.user.role || 'user' // Default if not present
    }
  });
});

module.exports = { getUserProfile };