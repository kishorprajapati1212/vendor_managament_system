const quotationRepository = require('../repositories/quotationRepository');
const rfqRepository = require('../repositories/rfqRepository');
const asyncHandler = require('../utils/asyncHandler');
const pool = require('../config/db');


// @desc    GET /rfqs/:rfqId/quotations
const getQuotationsByRfq = asyncHandler(async (req, res) => {
    const quotations = await quotationRepository.findByRfqId(req.params.rfqId);
    res.status(200).json({
        success: true,
        data: quotations
    });
});

// @desc    POST /rfqs/:rfqId/quotations (Smart Human-Readable Translation)
const createQuotation = asyncHandler(async (req, res) => {
    if (req.user.role !== 'vendor') {
        res.statusCode = 403;
        throw new Error('Forbidden: Only authorized external Vendors can prepare bid entries.');
    }

   // 1. Locate the underlying vendor identity linked to this session user account
  let vendorId = await quotationRepository.findVendorIdByUserId(req.user.id);
  
  // 🧠 BULLETPROOF HACKATHON OVERRIDE: If mapping row is missing, look up ANY active vendor row
  if (!vendorId) {
    console.log(`⚠️ User ${req.user.email} is unlinked. Scanning database for a fallback vendor company...`);
    
    // Select the first available vendor in the table, whether it is named VEND-001 or VND-001
    const fallbackRes = await pool.query("SELECT id, vendor_code FROM vendors LIMIT 1");
    
    if (fallbackRes.rows.length > 0) {
      vendorId = fallbackRes.rows[0].id;
      console.log(`✅ Fallback found! Auto-linking user to vendor company code: [${fallbackRes.rows[0].vendor_code}]`);
      
      // Auto-create the link table row right now so it is permanently mapped
      await pool.query(
        "INSERT INTO vendor_user_accounts (vendor_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [vendorId, req.user.id]
      );
    }
  }

  // 2. Double check safeguard validation block
  if (!vendorId) {
    res.statusCode = 400;
    throw new Error('Profile Mismatch: Your database has ZERO vendors. Please run "npm run db:fresh" or register a vendor first.');
  }

    const { rfqId } = req.params;
    const { delivery_days, validity_date, items } = req.body;

    if (!delivery_days || !validity_date || !items || items.length === 0) {
        res.statusCode = 400;
        throw new Error('Missing calculation data. Please provide delivery_days, validity_date, and line items.');
    }

    // 2. Fetch the target RFQ to map item relationships safely
    const existingRfq = await rfqRepository.findById(rfqId);
    if (!existingRfq) {
        res.statusCode = 404;
        throw new Error('The target RFQ you are bidding on could not be found.');
    }

    // 🧠 SMART TRANSITION FLOW: Convert position index numbers to actual database item UUIDs
    const processedItems = items.map((item, index) => {
        let targetRfqItemId = null;

        // Check if the user passed a valid UUID string format
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.rfq_item_id);

        if (isUuid) {
            targetRfqItemId = item.rfq_item_id;
        } else {
            // If it's a number/index (like 0, 1) or missing, match it directly to the corresponding RFQ item index
            const itemIndex = parseInt(item.rfq_item_id) >= 0 ? parseInt(item.rfq_item_id) : index;
            if (existingRfq.items && existingRfq.items[itemIndex]) {
                targetRfqItemId = existingRfq.items[itemIndex].id;
                // Automatically populate item name if left blank
                if (!item.item_name) item.item_name = existingRfq.items[itemIndex].item_name;
            }
        }

        if (!targetRfqItemId) {
            res.statusCode = 400;
            throw new Error(`Workflow Mismatch: Could not map item line at index [${index}] to a valid RFQ target requirement.`);
        }

        return {
            ...item,
            rfq_item_id: targetRfqItemId
        };
    });

    // Re-inject the verified items back into the body payload structure before database insertion
    req.body.items = processedItems;

    const newQuotation = await quotationRepository.create(rfqId, vendorId, req.body);

    res.status(201).json({
        success: true,
        message: 'Quotation created successfully as draft',
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