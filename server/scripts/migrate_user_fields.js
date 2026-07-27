const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'landchain.sqlite'),
  logging: false
});

const userColumns = [
  { name: 'first_name', definition: 'TEXT' },
  { name: 'middle_name', definition: 'TEXT' },
  { name: 'last_name', definition: 'TEXT' },
  { name: 'extension_name', definition: 'TEXT' },
  { name: 'phone2', definition: 'TEXT' },
  { name: 'birthdate', definition: 'TEXT' },
  { name: 'address', definition: 'TEXT' },
  { name: 'archived', definition: 'INTEGER DEFAULT 0' }
];

const listingColumns = [
  { name: 'assigned_buyer_id', definition: 'INTEGER' }
];

async function addColumnIfMissing(tableName, columnName, definition, queryInterface) {
  try {
    const tableDesc = await queryInterface.describeTable(tableName);
    if (!tableDesc[columnName]) {
      await sequelize.query(`ALTER TABLE "${tableName}" ADD COLUMN "${columnName}" ${definition}`);
      console.log(`  ✓ Added ${tableName}.${columnName}`);
    } else {
      console.log(`  - ${tableName}.${columnName} already exists, skipping`);
    }
  } catch (err) {
    console.error(`  ✗ Error on ${tableName}.${columnName}:`, err.message);
  }
}

async function run() {
  try {
    await sequelize.authenticate();
    console.log('Connected to SQLite database.\n');

    const qi = sequelize.getQueryInterface();

    console.log('Migrating users table...');
    for (const col of userColumns) {
      await addColumnIfMissing('users', col.name, col.definition, qi);
    }

    console.log('\nMigrating land_listings table...');
    for (const col of listingColumns) {
      await addColumnIfMissing('land_listings', col.name, col.definition, qi);
    }

    console.log('\nMigration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
  } finally {
    await sequelize.close();
  }
}

run();
