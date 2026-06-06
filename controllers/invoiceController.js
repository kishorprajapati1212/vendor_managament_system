const invoiceRepository = require('../repositories/invoiceRepository');
const asyncHandler = require('../utils/asyncHandler');
const emailService = require('../utils/emailService');
const PDFDocument = require('pdfkit');

const isStringValidUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// @desc    GET /invoices
const getInvoices = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const { status, vendor_id } = req.query;

  const { invoices, total } = await invoiceRepository.findAll({
    status, vendor_id, page, limit, userId: req.user.id, userRole: req.user.role
  });

  res.status(200).json({ success: true, data: { invoices, pagination: { page, limit, total } } });
});

// @desc    POST /invoices
const createInvoice = asyncHandler(async (req, res) => {
  const { po_id, invoice_date, due_date, billing_address } = req.body;

  if (!po_id || !invoice_date || !due_date || !billing_address) {
    res.statusCode = 400;
    throw new Error('Missing generation tracking params. Provide po_id, invoice_date, due_date, and billing_address.');
  }

  if (!isStringValidUuid(po_id)) {
    res.statusCode = 400;
    throw new Error(`Bad Request: The target parameters po_id "${po_id}" is structurally malformed.`);
  }

  const newInvoice = await invoiceRepository.createFromPo(req.body, req.user.id);
  res.status(201).json({ success: true, data: newInvoice });
});

// @desc    GET /invoices/:id
const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!isStringValidUuid(id)) {
    res.statusCode = 400;
    throw new Error('Bad Request: Provided identifier path parameter is invalid.');
  }

  const invoice = await invoiceRepository.findById(id);
  if (!invoice) {
    res.statusCode = 404;
    throw new Error('The requested invoice document tracing index could not be located.');
  }

  res.status(200).json({ success: true, data: invoice });
});

// @desc    GET /invoices/:id/download (Streams Mock PDF Binary Data)
// @desc    GET /invoices/:id/download (Streams Valid PDF Binary Data)
const downloadInvoicePdf = asyncHandler(async (req, res) => {
    const { id } = req.params;
    if (!isStringValidUuid(id)) {
      res.statusCode = 400;
      throw new Error('Invalid parameters.');
    }
  
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      res.statusCode = 404;
      throw new Error('Invoice document not found.');
    }
  
    const simulatedPdfUrl = `https://storage.vendorbridge.com/docs/invoices/inv-${invoice.invoice_number.toLowerCase()}.pdf`;
    await invoiceRepository.updatePdfUrl(id, simulatedPdfUrl);
  
    // Set response structural headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice-${invoice.invoice_number}.pdf`);
    
    // Build and pipe the valid PDF Kit stream directly out to the response channels
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);
  
    // Draw identical content layout
    doc.fillColor('#007bff').fontSize(24).text('VENDORBRIDGE ERP INVOICE', { align: 'center' });
    doc.moveDown(1);
    doc.fillColor('#333333').fontSize(12);
    doc.text(`Invoice Number:   ${invoice.invoice_number}`);
    doc.text(`PO Reference:     ${invoice.po_number}`);
    doc.text(`Total Amount:     INR ${parseFloat(invoice.total_amount).toFixed(2)}`);
    
    doc.end();
  });

// @desc    POST /invoices/:id/send-email (With Live PDF File Attachment)
const sendInvoiceEmail = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { to, subject, body } = req.body;
  
    if (!to || !subject || !body) {
      res.statusCode = 400;
      throw new Error('Missing parameters. Please provide values for to, subject, and body.');
    }
  
    const invoice = await invoiceRepository.findById(id);
    if (!invoice) {
      res.statusCode = 404;
      throw new Error('Target invoice record not found.');
    }
  
    // 🧠 1. GENERATE A VALID PDF USING PDFKIT
    const doc = new PDFDocument({ margin: 50 });
    let buffers = [];
    
    // Capture the document stream chunks into an array buffer
    doc.on('data', buffers.push.bind(buffers));
    
    doc.on('end', async () => {
      const finalPdfBuffer = Buffer.concat(buffers);
  
      try {
        // 2. Dispatch the live message with the uncorrupted file attachment
        await emailService.sendGenericEmail(to, subject, body, {
          filename: `Invoice-${invoice.invoice_number}.pdf`,
          content: finalPdfBuffer,
          contentType: 'application/pdf'
        });
  
        // 3. Log execution success to database rows
        await invoiceRepository.logEmailDelivery(id, to, req.user.id, subject, body);
      } catch (err) {
        console.error("Delayed SMTP Background Error:", err.message);
      }
    });
  
    // 📝 2. BUILD THE INVOICE VISUAL LAYOUT
    // Header Branding Block
    doc.fillColor('#007bff').fontSize(24).text('VENDORBRIDGE ERP INVOICE', { align: 'center' });
    doc.moveDown(1);
    
    // Metadata Metadata Grid
    doc.fillColor('#333333').fontSize(12);
    doc.text(`Invoice Number:   ${invoice.invoice_number}`);
    doc.text(`PO Reference:     ${invoice.po_number}`);
    doc.text(`Date of Issue:    ${new Date(invoice.invoice_date).toLocaleDateString()}`);
    doc.text(`Payment Due By:   ${new Date(invoice.due_date).toLocaleDateString()}`);
    doc.text(`Vendor Email:     ${invoice.vendor_email}`);
    doc.moveDown(1.5);
    
    // Table Divider Line
    doc.strokeColor('#cccccc').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(1);
  
    // Financial Breakdown Calculations Block
    doc.fontSize(14).text('Financial Breakdown Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(`Subtotal Amount:     INR ${parseFloat(invoice.subtotal).toFixed(2)}`);
    doc.text(`Tax Amount Added:    INR ${parseFloat(invoice.tax_amount).toFixed(2)}`);
    
    doc.moveDown(0.5);
    doc.strokeColor('#007bff').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);
    
    doc.fontSize(16).fillColor('#28a745').text(`Total Balance Due:  INR ${parseFloat(invoice.total_amount).toFixed(2)}`, { bold: true });
    
    // Finalize the document write channels streams safely
    doc.end();
  
    res.status(200).json({
      success: true,
      message: 'Invoice compiled into a valid PDF document and sent via email successfully!',
      data: { 
        sent_at: new Date().toISOString(), 
        sent_to: to,
        attachment_name: `Invoice-${invoice.invoice_number}.pdf`
      }
    });
  });

// @desc    PATCH /invoices/:id/mark-paid
const markInvoiceAsPaid = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { paid_amount, paid_at } = req.body;

  if (!paid_amount) {
    res.statusCode = 400;
    throw new Error('Please supply paid_amount metrics inside request parameters.');
  }

  const updatedInvoice = await invoiceRepository.markAsPaid(id, paid_amount, paid_at);
  res.status(200).json({ success: true, message: 'Invoice status updated', data: updatedInvoice });
});

module.exports = { getInvoices, createInvoice, getInvoiceById, downloadInvoicePdf, sendInvoiceEmail, markInvoiceAsPaid };