const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { create, getAll, getMine } = require('../controllers/transactionController');

router.post('/', authenticate, authorize('buyer', 'seller', 'admin'), create);
router.get('/', authenticate, authorize('admin'), getAll);
router.get('/mine', authenticate, getMine);

module.exports = router;
