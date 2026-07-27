const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { create, getMine, unreadCount, reply } = require('../controllers/inquiryController');

router.post('/', authenticate, authorize('buyer', 'admin'), create);
router.get('/', authenticate, getMine);
router.get('/unread-count', authenticate, unreadCount);
router.put('/:id/reply', authenticate, authorize('seller', 'admin'), reply);

module.exports = router;
