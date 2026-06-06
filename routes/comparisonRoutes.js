const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { compareQuotations, acceptQuotation } = require('../controllers/comparisonController');

const router = express.Router();

router.use(protect);

// Clearance restriction: External vendors have no access to compare prices or accept items [cite: 118, 128, 131]
router.get('/rfqs/:rfqId/quotations/compare', authorizeRoles('admin', 'procurement_officer', 'manager'), compareQuotations);
router.patch('/quotations/:id/accept', authorizeRoles('admin', 'procurement_officer'), acceptQuotation);

module.exports = router;