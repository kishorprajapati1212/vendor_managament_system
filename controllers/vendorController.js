const vendorRepository = require('../repositories/vendorRepository');
const asyncHandler = require('../utils/asyncHandler');

// @desc    GET /vendors
const getAllVendors = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status, category, search } = req.query;

  // Execute search filter sequence
  const { vendors, total, totalPages } = await vendorRepository.findAll({
    status, category, search, page, limit
  });

  res.status(200).json({
    success: true,
    data: {
      vendors,
      pagination: { page, limit, total, total_pages: totalPages }
    }
  });
});

// @desc    POST /vendors
const createVendor = asyncHandler(async (req, res) => {
  const { company_name, email, contact_person } = req.body;

  if (!company_name || !email || !contact_person) {
    res.statusCode = 400;
    throw new Error('Please fill out the required core attributes: company_name, email, and contact_person.');
  }

  const newVendor = await vendorRepository.create(req.body, req.user.id);

  res.status(201).json({
    success: true,
    message: 'Vendor registered successfully',
    data: newVendor
  });
});

// @desc    GET /vendors/:id
const getVendorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Strict Protection Check: If user is a vendor role, intercept and enforce ownership checks
  if (req.user.role === 'vendor') {
    const activeVendorRecord = await vendorRepository.findByLinkedUserId(req.user.id);
    if (!activeVendorRecord || activeVendorRecord.id !== id) {
      res.statusCode = 403;
      throw new Error('Forbidden: You are only permitted to access your own corporate profile data.');
    }
  }

  const vendor = await vendorRepository.findById(id);
  if (!vendor) {
    res.statusCode = 404;
    throw new Error(`No vendor record found mapping to ID: ${id}`);
  }

  res.status(200).json({
    success: true,
    data: vendor
  });
});

// @desc    PUT /vendors/:id
const updateVendor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const vendorExists = await vendorRepository.findById(id);
  if (!vendorExists) {
    res.statusCode = 404;
    throw new Error('Target update vendor entity could not be located.');
  }

  const updatedVendor = await vendorRepository.update(id, req.body);

  res.status(200).json({
    success: true,
    message: 'Vendor details updated successfully',
    data: updatedVendor
  });
});

// @desc    PATCH /vendors/:id/status
const updateVendorStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'inactive', 'blacklisted', 'pending'];
  if (!status || !validStatuses.includes(status)) {
    res.statusCode = 400;
    throw new Error('Invalid input state. Acceptable options: active | inactive | blacklisted | pending');
  }

  const updatedRecord = await vendorRepository.updateStatus(id, status);
  if (!updatedRecord) {
    res.statusCode = 404;
    throw new Error('Target vendor record could not be found.');
  }

  res.status(200).json({
    success: true,
    message: 'Vendor status updated',
    data: updatedRecord
  });
});

module.exports = {
  getAllVendors,
  createVendor,
  getVendorById,
  updateVendor,
  updateVendorStatus
};