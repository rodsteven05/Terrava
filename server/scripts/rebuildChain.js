require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const db = require('../models');
const Blockchain = require('../blockchain/Blockchain');

async function rebuild() {
  console.log('Rebuilding local blockchain from verified transactions...');

  await db.sequelize.sync();

  // Remove existing blocks so we can rebuild a valid chain
  await db.Block.destroy({ where: {}, truncate: true, cascade: false });
  console.log('Cleared existing blocks');

  const transactions = await db.Transaction.findAll({
    where: { status: 'verified' },
    order: [['id', 'ASC']]
  });

  if (transactions.length === 0) {
    console.log('No verified transactions to chain. Genesis block will be created on next server request.');
    await db.sequelize.close();
    process.exit(0);
  }

  const blockchain = new Blockchain();
  await blockchain.loadChain();
  await blockchain.persistGenesisIfEmpty();

  for (const txn of transactions) {
    await blockchain.addBlock(txn.id);
    console.log(`Added block for transaction #${txn.id}`);
  }

  const valid = blockchain.isChainValid();
  console.log(`\nRebuild complete. Chain length: ${blockchain.chain.length}, valid: ${valid}`);

  await db.sequelize.close();
  process.exit(valid ? 0 : 1);
}

rebuild().catch((err) => {
  console.error('Rebuild failed:', err);
  process.exit(1);
});
