const Block = require('./Block');
const db = require('../models');

class Blockchain {
  constructor() {
    this.chain = [];
  }

  async loadChain() {
    const blocks = await db.Block.findAll({
      order: [['index', 'ASC']],
      include: [{ model: db.Transaction, as: 'transaction' }]
    });

    if (blocks.length === 0) {
      this.chain = [this.createGenesisBlock()];
    } else {
      this.chain = blocks.map((b) => {
        let transactionData = b.transaction_data;
        if (transactionData && typeof transactionData === 'string') {
          try { transactionData = JSON.parse(transactionData); } catch (e) { transactionData = null; }
        }
        if (!transactionData) {
          transactionData = b.transaction
            ? b.transaction.toJSON()
            : { message: 'Genesis Block' };
        }
        return new Block(
          b.index,
          new Date(b.timestamp).getTime(),
          transactionData,
          b.previous_hash,
          b.nonce
        );
      });
    }
  }

  createGenesisBlock() {
    const genesis = new Block(0, Date.now(), { message: 'Genesis Block' }, '0');
    genesis.mineBlock(2);
    return genesis;
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  async addBlock(transactionId, difficulty = 2) {
    const transaction = await db.Transaction.findByPk(transactionId);
    if (!transaction) throw new Error('Transaction not found');

    const previousBlock = this.getLatestBlock();
    const newBlock = new Block(
      this.chain.length,
      Date.now(),
      transaction.toJSON(),
      previousBlock.hash
    );
    newBlock.mineBlock(difficulty);

    await db.Block.create({
      index: newBlock.index,
      timestamp: new Date(newBlock.timestamp),
      transaction_id: transaction.id,
      transaction_data: JSON.stringify(transaction.toJSON()),
      previous_hash: newBlock.previousHash,
      hash: newBlock.hash,
      nonce: newBlock.nonce
    });

    this.chain.push(newBlock);
    return newBlock;
  }

  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) return false;
      if (current.previousHash !== previous.hash) return false;
    }
    return true;
  }

  async persistGenesisIfEmpty() {
    const count = await db.Block.count();
    if (count === 0) {
      const genesis = this.createGenesisBlock();
      await db.Block.create({
        index: genesis.index,
        timestamp: new Date(genesis.timestamp),
        transaction_id: null,
        transaction_data: JSON.stringify({ message: 'Genesis Block' }),
        previous_hash: genesis.previousHash,
        hash: genesis.hash,
        nonce: genesis.nonce
      });
      this.chain = [genesis];
    }
  }
}

module.exports = Blockchain;
