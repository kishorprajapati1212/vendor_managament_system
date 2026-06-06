const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getDashboardSummary, getDashboardRecentActivity } = require('../controllers/dashboardController');

const router = express.Router();

// Dashboard tracking requires a valid verified user session universally
router.use(protect);

router.get('/dashboard/summary', getDashboardSummary);
router.get('/dashboard/recent-activity', getDashboardRecentActivity);

module.exports = router;