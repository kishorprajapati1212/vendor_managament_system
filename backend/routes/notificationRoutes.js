const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  readNotification,
  readAllNotifications
} = require('../controllers/notificationController');

const router = express.Router();

// Enforce token validation check universally for all notification sub-routes
router.use(protect);

router.get('/notifications', getNotifications);
router.patch('/notifications/read-all', readAllNotifications); // Place this ABOVE the :id route parameter line!
router.patch('/notifications/:id/read', readNotification);

module.exports = router;