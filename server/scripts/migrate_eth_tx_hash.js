const path = require('path');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'landchain.sqlite'),
  logging: false
});

async function migrate() {
  const qi = sequelize.getQueryInterface();
  try {
    await qi.addColumn('transactions', 'eth_tx_hash', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
    console.log('✅ Added eth_tx_hash column to transactions table');
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('duplicate')) {
      console.log('ℹ️  eth_tx_hash column already exists, skipping');
    } else {
      console.error('Migration failed:', e.message);
    }
  } finally {
    await sequelize.close();
  }
}

migrate();
