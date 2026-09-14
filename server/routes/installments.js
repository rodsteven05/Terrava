const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const controller = require('../controllers/installmentController');

router.get('/', authenticate, authorize('admin'), controller.getAll);
router.get('/mine', authenticate, controller.getMine);
router.get('/:id', authenticate, controller.getById);
router.post('/:id/payments', authenticate, controller.recordPayment);
router.patch('/:id/penalty-rate', authenticate, controller.updatePenaltyRate);
router.post('/check-overdue', authenticate, authorize('admin'), controller.runOverdueCheck);
router.post('/listing/:listingId', authenticate, controller.createFromListing);

module.exports = router;
