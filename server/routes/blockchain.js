const express = require('express');
const router = express.Router();
const { validate, getChain, getContract } = require('../controllers/blockchainController');
const { authenticate, authorize, requireLedgerAccess } = require('../middleware/auth');

router.use(authenticate, authorize('admin'), requireLedgerAccess);

router.get('/validate', validate);
router.get('/chain', getChain);
router.get('/contract', getContract);

module.exports = router;
