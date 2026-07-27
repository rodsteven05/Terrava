const db = require('../models');

async function fixInquiryDates() {
  try {
    const now = new Date();

    const [createdResult] = await db.sequelize.query(
      `UPDATE inquiries SET created_at = :now WHERE created_at IS NULL`,
      { replacements: { now }, type: db.sequelize.QueryTypes.UPDATE }
    );

    const [updatedResult] = await db.sequelize.query(
      `UPDATE inquiries SET updated_at = :now WHERE updated_at IS NULL`,
      { replacements: { now }, type: db.sequelize.QueryTypes.UPDATE }
    );

    console.log(`Fixed ${createdResult} missing created_at values.`);
    console.log(`Fixed ${updatedResult} missing updated_at values.`);
    process.exit(0);
  } catch (err) {
    console.error('Failed to fix inquiry dates:', err);
    process.exit(1);
  }
}

fixInquiryDates();
