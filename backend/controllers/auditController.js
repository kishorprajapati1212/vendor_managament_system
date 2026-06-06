const auditRepository = require('../repositories/auditRepository');
const asyncHandler = require('../utils/asyncHandler');

// @desc    GET /activity-logs
const getActivityLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { entity_type, entity_id, user_id, action, from, to } = req.query;

  const { logs, total } = await auditRepository.findAll({
    entity_type, entity_id, user_id, action, from, to, page, limit,
    sessionUserId: req.user.id, sessionUserRole: req.user.role
  });

  res.status(200).json({
    success: true,
    data: { logs, pagination: { page, limit, total } }
  });
});

module.exports = { getActivityLogs };