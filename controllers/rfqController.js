const rfqRepository = require('../repositories/rfqRepository');
const vendorRepository = require('../repositories/vendorRepository');
const asyncHandler = require('../utils/asyncHandler');

// @desc    GET /rfqs
const getRfqs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status, search } = req.query;

  const { rfqs, total } = await rfqRepository.findAll({ status, search, page, limit });

  res.status(200).json({
    success: true,
    data: {
      rfqs,
      pagination: { page, limit, total }
    }
  });
});

// @desc    POST /rfqs (Smart Human-Readable ID Translation)
const createRfq = asyncHandler(async (req, res) => {
    const { title, deadline, items, vendor_ids } = req.body;
  
    if (!title || !deadline || !items || items.length === 0) {
      res.statusCode = 400;
      throw new Error('Missing core parameters. An RFQ needs a title, deadline, and at least one item line.');
    }
  
    // 🧠 SMART TRANSITION FLOW: Convert any human strings (VND-001 or email) into true UUIDs
    const processedVendorUuids = [];
    
    if (vendor_ids && vendor_ids.length > 0) {
      for (const identifier of vendor_ids) {
        // Validate if it's already a valid UUID format using regex
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);
        
        if (isUuid) {
          processedVendorUuids.push(identifier);
        } else {
          // Look up by VND-001 or email string
          const vendorRecord = await vendorRepository.findByCodeOrEmail(identifier);
          if (!vendorRecord) {
            res.statusCode = 400;
            throw new Error(`Workflow Mismatch: No vendor could be found matching identifier: "${identifier}"`);
          }
          processedVendorUuids.push(vendorRecord.id);
        }
      }
    }
  
    // Reassign the verified UUID list back to the payload body before repository insertion
    req.body.vendor_ids = processedVendorUuids;
  
    const newRfq = await rfqRepository.create(req.body, req.user.id);
  
    res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: newRfq
    });
  });

// @desc    GET /rfqs/:id
const getRfqById = asyncHandler(async (req, res) => {
  const rfq = await rfqRepository.findById(req.params.id);
  if (!rfq) {
    res.statusCode = 404;
    throw new Error('The requested RFQ profile could not be located.');
  }

  res.status(200).json({
    success: true,
    data: rfq
  });
});

// @desc    PUT /rfqs/:id
const updateRfq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existingRfq = await rfqRepository.findById(id);

  if (!existingRfq) {
    res.statusCode = 404;
    throw new Error('Target RFQ record not found.');
  }

  // Specification Rule: Update allowed ONLY in draft status state
  if (existingRfq.status !== 'draft') {
    res.statusCode = 400;
    throw new Error(`Modification Rejected: Cannot alter an RFQ once it is in a '${existingRfq.status}' state.`);
  }

  const updatedRfq = await rfqRepository.update(id, req.body);

  res.status(200).json({
    success: true,
    message: 'RFQ modified successfully',
    data: updatedRfq
  });
});

// @desc    PATCH /rfqs/:id/publish
const publishRfq = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const existingRfq = await rfqRepository.findById(id);

  if (!existingRfq) {
    res.statusCode = 404;
    throw new Error('Target RFQ entity not found.');
  }

  const result = await rfqRepository.publish(id);

  res.status(200).json({
    success: true,
    message: 'RFQ published and vendors notified',
    data: result
  });
});

// @desc    POST /rfqs/:id/attachments
const uploadAttachment = asyncHandler(async (req, res) => {
  // Hackathon Shortcut: If you haven't configured a file upload middleware like multer yet, 
  // you can read from req.body to simulate file object details instantly
  const mockFileObject = req.file || {
    originalname: req.body.file_name || 'blueprint.pdf',
    path: req.body.file_url || 'https://storage.vendorbridge.com/docs/blueprint.pdf',
    size: req.body.file_size || 1024,
    mimetype: req.body.mime_type || 'application/pdf'
  };

  const attachment = await rfqRepository.addAttachment(req.params.id, mockFileObject);

  res.status(201).json({
    success: true,
    message: 'Attachment uploaded successfully',
    data: attachment
  });
});

// @desc    DELETE /rfqs/:rfqId/attachments/:attachmentId
const removeAttachment = asyncHandler(async (req, res) => {
  const { rfqId, attachmentId } = req.params;
  const target = await rfqRepository.deleteAttachment(rfqId, attachmentId);

  if (!target) {
    res.statusCode = 404;
    throw new Error('Attachment record not found matching provided identity parameters.');
  }

  res.status(200).json({
    success: true,
    message: 'Attachment removed successfully'
  });
});

module.exports = {
  getRfqs,
  createRfq,
  getRfqById,
  updateRfq,
  publishRfq,
  uploadAttachment,
  removeAttachment
};