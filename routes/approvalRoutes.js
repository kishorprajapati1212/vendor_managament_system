const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getApprovals,
  getApprovalById,
  approveWorkflowStep,
  rejectWorkflowStep
} = require('../controllers/approvalController');

const router = express.Router();

router.use(protect);

// Approval review features are restricted strictly to authorized managers/administrators
router.get('/approvals', authorizeRoles('manager', 'admin'), getApprovals);
router.get('/approvals/:id', authorizeRoles('manager', 'admin'), getApprovalById);
router.patch('/approvals/:id/approve', authorizeRoles('manager', 'admin'), approveWorkflowStep);
router.patch('/approvals/:id/reject', authorizeRoles('manager', 'admin'), rejectWorkflowStep);

module.exports = router;