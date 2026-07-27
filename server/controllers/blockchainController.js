const Blockchain = require('../blockchain/Blockchain');
const db = require('../models');

exports.validate = async (req, res) => {
  try {
    const blockchain = new Blockchain();
    await blockchain.loadChain();
    const valid = blockchain.isChainValid();
    res.json({ valid, chainLength: blockchain.chain.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getContract = (req, res) => {
  try {
    const address = process.env.CONTRACT_ADDRESS;
    if (!address) return res.status(500).json({ error: 'Contract address not configured' });
    res.json({
      address,
      explorerUrl: `https://sepolia.etherscan.io/address/${address}`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getChain = async (req, res) => {
  try {
    const blocks = await db.Block.findAll({
      order: [['index', 'ASC']],
      include: [{
        model: db.Transaction,
        as: 'transaction',
        required: false,
        include: [
          { model: db.LandListing, as: 'listing', attributes: ['id', 'title', 'location_text'] },
          { model: db.User, as: 'buyer', attributes: ['id', 'full_name', 'email'] },
          { model: db.User, as: 'seller', attributes: ['id', 'full_name', 'email'] }
        ]
      }]
    });
    res.json(blocks);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
