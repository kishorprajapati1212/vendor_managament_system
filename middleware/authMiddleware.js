const jwt = require('jsonwebtoken');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Extract current fresh context status from users table matching UUID
      const userRes = await pool.query('SELECT id, email, role, full_name FROM users WHERE id = $1', [decoded.id]);
      
      if (userRes.rows.length === 0) {
        res.statusCode = 401;
        throw new Error('User account no longer exists.');
      }

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
    if (!req.user || !roles.includes(req.user.role)) {
      res.statusCode = 403;
      throw new Error(`Forbidden: Role '${req.user?.role || 'Guest'}' lacks required execution clearance`);
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };