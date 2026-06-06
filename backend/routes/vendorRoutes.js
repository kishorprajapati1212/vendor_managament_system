const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getAllVendors,
  createVendor,
  getVendorById,
  updateVendor,
  updateVendorStatus
} = require('../controllers/vendorController');

const router = express.Router();

// Apply global authentication security block across all vendor management operations
router.use(protect);

// Routes mapping
router.get('/', authorizeRoles('admin', 'procurement_officer', 'manager'), getAllVendors);
router.post('/', authorizeRoles('admin', 'procurement_officer'), createVendor);

// Note: Vendors can view their own profile, so we permit 'vendor' in getVendorById controller ownership handler
router.get('/:id', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getVendorById);
router.put('/:id', authorizeRoles('admin', 'procurement_officer'), updateVendor);
router.patch('/:id/status', authorizeRoles('admin', 'procurement_officer'), updateVendorStatus);

module.exports = router;