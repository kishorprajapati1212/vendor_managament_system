const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const {
  getRfqs,
  createRfq,
  getRfqById,
  updateRfq,
  publishRfq,
  uploadAttachment,
  removeAttachment
} = require('../controllers/rfqController');

const router = express.Router();

// Secure all access behind session verification token guards
router.use(protect);

// Read permissions opened globally to all authorized organizational accounts
router.get('/', getRfqs);
router.get('/:id', getRfqById);

// Creation, Modification, Publication restricted explicitly to internal managers/officers
router.post('/', authorizeRoles('admin', 'procurement_officer'), createRfq);
router.put('/:id', authorizeRoles('admin', 'procurement_officer'), updateRfq);
router.patch('/:id/publish', authorizeRoles('admin', 'procurement_officer'), publishRfq);

// Attachment file manipulation management pipelines
router.post('/:id/attachments', authorizeRoles('admin', 'procurement_officer'), uploadAttachment);
router.delete('/:rfqId/attachments/:attachmentId', authorizeRoles('admin', 'procurement_officer'), removeAttachment);

module.exports = router;