const approvalRepository = require('../repositories/approvalRepository');
const asyncHandler = require('../utils/asyncHandler');

// Regular Expression to validate UUID structural completeness
const isUuidValid = (uuid) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);

// @desc    GET /approvals
const getApprovals = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status } = req.query;

  const { approvals, total } = await approvalRepository.findAll({
    status, page, limit, userId: req.user.id, userRole: req.user.role
  });

  res.status(200).json({
    success: true,
    data: {
      approvals,
      pagination: { page, limit, total }
    }
  });
});

// @desc    GET /approvals/:id
const getApprovalById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isUuidValid(id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The approval track parameter ID "${id}" is incomplete or structurally invalid.`);
  }

  const approval = await approvalRepository.findById(id);
  if (!approval) {
    res.statusCode = 404;
    throw new Error('Target approval documentation trace could not be found.');
  }

  res.status(200).json({
    success: true,
    data: approval
  });
});

// @desc    PATCH /approvals/:id/approve
const approveWorkflowStep = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  if (!isUuidValid(id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The provided signature ID "${id}" is truncated or invalid.`);
  }

  const data = await approvalRepository.processApproval(id, remarks);

  res.status(200).json({
    success: true,
    message: 'Quotation approved successfully',
    data: {
      status: data.status,
      approved_at: data.approved_at
    }
  });
});

// @desc    PATCH /approvals/:id/reject
const rejectWorkflowStep = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { remarks } = req.body;

  if (!isUuidValid(id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The provided identification signature ID "${id}" is invalid.`);
  }

  const data = await approvalRepository.processRejection(id, remarks);

  res.status(200).json({
    success: true,
    message: 'Quotation rejected',
    data: { status: data.status }
  });
});

module.exports = {
  getApprovals,
  getApprovalById,
  approveWorkflowStep,
  rejectWorkflowStep
};