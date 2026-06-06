const quotationRepository = require('../repositories/quotationRepository');
const asyncHandler = require('../utils/asyncHandler');

// @desc    GET /rfqs/:rfqId/quotations
const getQuotationsByRfq = asyncHandler(async (req, res) => {
  const quotations = await quotationRepository.findByRfqId(req.params.rfqId);
  res.status(200).json({
    success: true,
    data: quotations
  });
});

// @desc    POST /rfqs/:rfqId/quotations
const createQuotation = asyncHandler(async (req, res) => {
  if (req.user.role !== 'vendor') {
    res.statusCode = 403;
    throw new Error('Forbidden: Only authorized external Vendors can prepare bid entries.');
  }

  // Locate the underlying vendor entity identity linked to this session user account
  const vendorId = await quotationRepository.findVendorIdByUserId(req.user.id);
  if (!vendorId) {
    res.statusCode = 400;
    throw new Error('Profile Mismatch: Your user account is not currently linked to any registered vendor company.');
  }

  const { delivery_days, validity_date, items } = req.body;
  if (!delivery_days || !validity_date || !items || items.length === 0) {
    res.statusCode = 400;
    throw new Error('Missing calculation data. Please provide delivery_days, validity_date, and line items.');
  }

  const newQuotation = await quotationRepository.create(req.params.rfqId, vendorId, req.body);

  res.status(201).json({
    success: true,
    data: newQuotation
  });
});

// @desc    PUT /quotations/:id
const updateQuotation = asyncHandler(async (req, res) => {
  const existingQuotation = await quotationRepository.findById(req.params.id);
  if (!existingQuotation) {
    res.statusCode = 404;
    throw new Error('Target quotation document record could not be found.');
  }

  const vendorId = await quotationRepository.findVendorIdByUserId(req.user.id);
  if (existingQuotation.vendor_id !== vendorId) {
    res.statusCode = 403;
    throw new Error('Forbidden: Access denied. This quotation entry belongs to another corporate entity.');
  }

  // Rule Protection Safeguard: Allowed only in draft state
  if (existingQuotation.status !== 'draft') {
    res.statusCode = 400;
    throw new Error(`Modification Rejected: Quotations locked in a '${existingQuotation.status}' state cannot be edited.`);
  }

  const updatedQuotation = await quotationRepository.update(req.params.id, req.body);
  res.status(200).json({
    success: true,
    message: 'Quotation modified successfully',
    data: updatedQuotation
  });
});

// @desc    PATCH /quotations/:id/submit
const submitQuotation = asyncHandler(async (req, res) => {
  const existingQuotation = await quotationRepository.findById(req.params.id);
  if (!existingQuotation) {
    res.statusCode = 404;
    throw new Error('Target quotation record not found.');
  }

  const vendorId = await quotationRepository.findVendorIdByUserId(req.user.id);
  if (existingQuotation.vendor_id !== vendorId) {
    res.statusCode = 403;
    throw new Error('Access denied: You cannot submit this document.');
  }

  const result = await quotationRepository.submitForReview(req.params.id, existingQuotation.rfq_id, vendorId);
  res.status(200).json({
    success: true,
    message: 'Quotation submitted successfully',
    data: result
  });
});

module.exports = {
  getQuotationsByRfq,
  createQuotation,
  updateQuotation,
  submitQuotation
};