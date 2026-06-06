const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { getProcurementSummary, getVendorPerformanceReport, getMonthlySpendTrendReport, exportReports } = require('../controllers/reportController');

const router = express.Router();

// Block external vendor access completely from internal financial strategy reports
router.use(protect);
router.use(authorizeRoles('admin', 'manager', 'procurement_officer'));

router.get('/reports/procurement-summary', getProcurementSummary);
router.get('/reports/vendor-performance', getVendorPerformanceReport);
router.get('/reports/monthly-spend', getMonthlySpendTrendReport);
router.get('/reports/export', exportReports);

module.exports = router;