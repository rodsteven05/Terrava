require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Sequelize } = require('sequelize');

const sqlitePath = path.join(__dirname, 'landchain.sqlite');
const sqliteDb = new sqlite3.Database(sqlitePath);

const host = process.env.DB_HOST || 'localhost';
const port = process.env.DB_PORT || 5432;
const username = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || 'password';
const database = process.env.DB_NAME || 'landchain';

const jsonColumns = {
  land_listings: ['polygon_geojson', 'photos', 'utilities'],
  notifications: ['data']
};

const tableOrder = [
  'users',
  'land_listings',
  'inquiries',
  'favorites',
  'transactions',
  'blocks',
  'notifications',
  'system_logs'
];

async function ensureDatabaseExists() {
  const sequelize = new Sequelize('postgres', username, password, {
    dialect: 'postgres',
    host,
    port,
    logging: false
  });

  try {
    await sequelize.query(`CREATE DATABASE "${database}";`);
    console.log(`Created database "${database}"`);
  } catch (err) {
    if (err.message && err.message.includes('already exists')) {
      console.log(`Database "${database}" already exists`);
    } else {
      throw err;
    }
  } finally {
    await sequelize.close();
  }
}

function mapTimestampKeys(row) {
  const mapped = { ...row };
  if ('created_at' in mapped) {
    mapped.createdAt = mapped.created_at;
    delete mapped.created_at;
  }
  if ('updated_at' in mapped) {
    mapped.updatedAt = mapped.updated_at;
    delete mapped.updated_at;
  }
  return mapped;
}

function parseJson(row, tableName) {
  const cols = jsonColumns[tableName] || [];
  const parsed = { ...row };
  for (const col of cols) {
    const value = parsed[col];
    if (value && typeof value === 'string') {
      try {
        parsed[col] = JSON.parse(value);
      } catch (e) {
        console.warn(`Failed to parse JSON for ${tableName}.${col}: ${value}`);
        parsed[col] = null;
      }
    }
  }
  return parsed;
}

async function getSqliteRows(tableName) {
  return new Promise((resolve, reject) => {
    sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function resetSequence(queryInterface, tableName) {
  try {
    await queryInterface.sequelize.query(
      `SELECT setval(pg_get_serial_sequence('"${tableName}"', 'id'), COALESCE((SELECT MAX(id) FROM "${tableName}"), 1), true);`
    );
    console.log(`Reset sequence for ${tableName}`);
  } catch (err) {
    console.warn(`Could not reset sequence for ${tableName}: ${err.message}`);
  }
}

async function migrate() {
  console.log('Starting SQLite to PostgreSQL migration...');
  console.log(`SQLite source: ${sqlitePath}`);
  console.log(`PostgreSQL target: ${host}:${port}/${database}`);

  await ensureDatabaseExists();

  const db = require('./models');
  const queryInterface = db.sequelize.getQueryInterface();

  await db.sequelize.sync({ force: true });
  console.log('PostgreSQL tables created');

  const modelMap = {
    users: db.User,
    land_listings: db.LandListing,
    inquiries: db.Inquiry,
    favorites: db.Favorite,
    transactions: db.Transaction,
    blocks: db.Block,
    notifications: db.Notification,
    system_logs: db.SystemLog
  };

  for (const tableName of tableOrder) {
    const rows = await getSqliteRows(tableName);
    if (rows.length === 0) {
      console.log(`Skipping ${tableName}: no rows`);
      continue;
    }

    const model = modelMap[tableName];
    const parsedRows = rows.map((row) => parseJson(mapTimestampKeys(row), tableName));
    await model.bulkCreate(parsedRows, { validate: false, hooks: false });
    console.log(`Migrated ${rows.length} rows into ${tableName}`);

    await resetSequence(queryInterface, tableName);
  }

  await db.sequelize.close();
  sqliteDb.close();

  console.log('\nMigration completed successfully.');
  console.log('You can now start the server with: npm run dev');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
