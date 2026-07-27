const express = require('express');
const router = express.Router();
const { validate, getChain, getContract } = require('../controllers/blockchainController');

router.get('/validate', validate);
router.get('/chain', getChain);
router.get('/contract', getContract);

module.exports = router;
