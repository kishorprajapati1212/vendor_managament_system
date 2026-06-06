const poRepository = require('../repositories/poRepository');
const asyncHandler = require('../utils/asyncHandler');

// Controller guard regex tracking UUID integrity
const isStringValidUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// @desc    GET /purchase-orders
const getPurchaseOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status, vendor_id } = req.query;

  const { purchaseOrders, total } = await poRepository.findAll({
    status, vendor_id, page, limit, userId: req.user.id, userRole: req.user.role
  });

  res.status(200).json({
    success: true,
    data: {
      purchaseOrders,
      pagination: { page, limit, total }
    }
  });
});

// @desc    POST /purchase-orders
const createPurchaseOrder = asyncHandler(async (req, res) => {
  const { quotation_id, delivery_date, billing_address, shipping_address } = req.body;

  if (!quotation_id || !delivery_date || !billing_address || !shipping_address) {
    res.statusCode = 400;
    throw new Error('Missing document details. Provide quotation_id, delivery_date, billing_address, and shipping_address.');
  }

  if (!isStringValidUuid(quotation_id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The target quotation_id "${quotation_id}" is malformed or truncated.`);
  }

  const newPo = await poRepository.createFromQuotation(req.body, req.user.id);

  res.status(201).json({
    success: true,
    data: newPo
  });
});

// @desc    GET /purchase-orders/:id
const getPurchaseOrderById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isStringValidUuid(id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The URL parameter id "${id}" is invalid.`);
  }

  const po = await poRepository.findById(id);
  if (!po) {
    res.statusCode = 404;
    throw new Error('The target purchase order document record could not be found.');
  }

  res.status(200).json({
    success: true,
    data: po
  });
});

// @desc    PATCH /purchase-orders/:id/issue
const issuePurchaseOrder = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isStringValidUuid(id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The target document update ID "${id}" is malformed.`);
  }

  const updatedData = await poRepository.issueToVendor(id);
  if (!updatedData) {
    res.statusCode = 404;
    throw new Error('Target purchase order record not found.');
  }

  res.status(200).json({
    success: true,
    message: 'PO issued to vendor',
    data: {
      status: updatedData.status,
      issued_at: updatedData.issued_at
    }
  });
});

module.exports = {
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  issuePurchaseOrder
};