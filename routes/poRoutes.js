const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getPurchaseOrders,
  createPurchaseOrder,
  getPurchaseOrderById,
  issuePurchaseOrder
} = require('../controllers/poController');

const router = express.Router();

router.use(protect);

// Global route registrations mapping role privileges [cite: 118, 123]
router.get('/purchase-orders', getPurchaseOrders); // Handled inside repository based on role context 
router.get('/purchase-orders/:id', getPurchaseOrderById);

router.post('/purchase-orders', authorizeRoles('admin', 'procurement_officer'), createPurchaseOrder); 
router.patch('/purchase-orders/:id/issue', authorizeRoles('admin', 'procurement_officer'), issuePurchaseOrder);

module.exports = router;