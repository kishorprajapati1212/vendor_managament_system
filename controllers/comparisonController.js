const comparisonRepository = require('../repositories/comparisonRepository');
const asyncHandler = require('../utils/asyncHandler');

// Helper to validate UUID string formats cleanly on controllers
const validateUuidString = (id) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
};

// @desc    GET /rfqs/:rfqId/quotations/compare
const compareQuotations = asyncHandler(async (req, res) => {
  const { rfqId } = req.params;
  const { sort_by } = req.query; 

  if (!validateUuidString(rfqId)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The URL parameter rfqId "${rfqId}" is structurally incomplete or invalid.`);
  }

  const matrix = await comparisonRepository.getComparisonMatrix(rfqId, sort_by);
  if (!matrix) {
    res.statusCode = 404;
    throw new Error('Comparison Matrix processing failed: The target RFQ record could not be found.');
  }

  res.status(200).json({
    success: true,
    data: matrix
  });
});

// @desc    PATCH /quotations/:id/accept
const acceptQuotation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!validateUuidString(id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The quotation target ID "${id}" is truncated or invalid.`);
  }

  // Choose an internal manager to attach as the Level 1 review gate authority holder
  // For easy hackathon simulation, look up any manager or fall back to the project admin profile
  const managerResult = await pool.query("SELECT id FROM users WHERE role = 'manager' AND status = 'active' LIMIT 1");
  const approverId = managerResult.rows[0]?.id || req.user.id;

  await comparisonRepository.acceptQuotationAndInitWorkflow(id, approverId);

  res.status(200).json({
    success: true,
    message: 'Quotation accepted, approval workflow initiated'
  });
});

module.exports = {
  compareQuotations,
  acceptQuotation
};