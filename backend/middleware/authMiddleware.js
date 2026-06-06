const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Extract core profile parameters from database using UUID string
      const userRes = await pool.query(
        'SELECT id, email, role, full_name, phone, last_login_at FROM users WHERE id = $1', 
        [decoded.id]
      );
      
      if (userRes.rows.length === 0) {
        res.statusCode = 401;
        throw new Error('User account no longer exists.');
      }

      // Attach full database profile layout context to request object
      req.user = userRes.rows[0];
      return next();
    } catch (error) {
      res.statusCode = 401;
      throw new Error('Not authorized, session token signature verification failed');
    }
  }

  if (!token) {
    res.statusCode = 401;
    throw new Error('Access denied, missing authorization token');
  }
});

// Role Verification Middleware Factory
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      res.statusCode = 401;
      throw new Error('Unauthenticated: Access requires a valid logged-in session.');
    }

    // 🔥 HACKATHON DEBUGGING SHORTCUT: If the user is an 'admin', let them pass any endpoint check!
    if (req.user.role === 'admin') {
      return next();
    }

    // Standard structural check matching current role parameters
    if (!roles.includes(req.user.role)) {
      res.statusCode = 403;
      throw new Error(`Forbidden: Role '${req.user.role}' lacks the required clearance for this action.`);
    }

    next();
  };
};

module.exports = { protect, authorizeRoles };