const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { getInvoices, createInvoice, getInvoiceById, downloadInvoicePdf, sendInvoiceEmail, markInvoiceAsPaid } = require('../controllers/invoiceController');

const router = express.Router();

router.use(protect);

// Unified global endpoint routers mapping role privileges
router.get('/invoices', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getInvoices);
router.get('/invoices/:id', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), getInvoiceById);
router.get('/invoices/:id/download', authorizeRoles('admin', 'procurement_officer', 'manager', 'vendor'), downloadInvoicePdf);

router.post('/invoices', authorizeRoles('admin', 'procurement_officer'), createInvoice);
router.post('/invoices/:id/send-email', authorizeRoles('admin', 'procurement_officer'), sendInvoiceEmail);
router.patch('/invoices/:id/mark-paid', authorizeRoles('admin', 'procurement_officer'), markInvoiceAsPaid);

module.exports = router;