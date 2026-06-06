const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getQuotationsByRfq,
  createQuotation,
  updateQuotation,
  submitQuotation
} = require('../controllers/quotationController');

const router = express.Router({ mergeParams: true }); // mergeParams lets us read :rfqId out of nested root levels

router.use(protect);

// Mapping nested route chains
router.get('/rfqs/:rfqId/quotations', authorizeRoles('admin', 'procurement_officer', 'manager'), getQuotationsByRfq);
router.post('/rfqs/:rfqId/quotations', authorizeRoles('vendor'), createQuotation);

// Independent route blocks
router.put('/quotations/:id', authorizeRoles('vendor'), updateQuotation);
router.patch('/quotations/:id/submit', authorizeRoles('vendor'), submitQuotation);

module.exports = router;