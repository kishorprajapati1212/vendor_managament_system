const notificationRepository = require('../repositories/notificationRepository');
const asyncHandler = require('../utils/asyncHandler');

// Regular Expression to enforce UUID structure accuracy
const isStringValidUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// @desc    GET /notifications
const getNotifications = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { is_read } = req.query;

  const { notifications, unread_count, total } = await notificationRepository.findAllByUser(
    req.user.id, 
    { is_read, page, limit }
  );

  res.status(200).json({
    success: true,
    data: {
      notifications,
      unread_count,
      pagination: { page, limit, total }
    }
  });
});

// @desc    PATCH /notifications/:id/read
const readNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isStringValidUuid(id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The provided notification ID "${id}" is truncated or structurally malformed.`);
  }

  const matches = await notificationRepository.markAsRead(id, req.user.id);
  if (!matches) {
    res.statusCode = 404;
    throw new Error('Target notification record not found or access privilege denied.');
  }

  res.status(200).json({
    success: true
  });
});

// @desc    PATCH /notifications/read-all
const readAllNotifications = asyncHandler(async (req, res) => {
  await notificationRepository.markAllAsRead(req.user.id);
  
  res.status(200).json({
    success: true,
    message: 'All notifications marked as read'
  });
});

module.exports = {
  getNotifications,
  readNotification,
  readAllNotifications
};