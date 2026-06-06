const dashboardRepository = require('../repositories/dashboardRepository');
const asyncHandler = require('../utils/asyncHandler');

// @desc    GET /dashboard/summary
const getDashboardSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardRepository.getSummaryMetrics(req.user.id, req.user.role);
  res.status(200).json({
    success: true,
    data: summary
  });
});

// @desc    GET /dashboard/recent-activity
const getDashboardRecentActivity = asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const activity = await dashboardRepository.getRecentActivityTrails(req.user.id, req.user.role, limit);
  res.status(200).json({
    success: true,
    data: activity
  });
});

module.exports = { getDashboardSummary, getDashboardRecentActivity };