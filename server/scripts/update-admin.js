require('dotenv').config();
const db = require('../models');
const { hashPassword } = require('../utils/password');

(async () => {
  try {
    await db.sequelize.sync();
    let admin = await db.User.findOne({ where: { role: 'admin' } });

    if (!admin) {
      admin = await db.User.create({
        email: 'Admin@gmail.com',
        password_hash: await hashPassword('Admin123@'),
        full_name: 'System Administrator',
        role: 'admin',
        phone: '09170000000'
      });
      console.log('Created admin:', admin.email);
    } else {
      admin.email = 'Admin@gmail.com';
      admin.password_hash = await hashPassword('Admin123@');
      await admin.save();
      console.log('Updated admin:', admin.email);
    }
  } catch (err) {
    console.error('Failed to update admin:', err.message);
    process.exit(1);
  }
  process.exit(0);
})();
