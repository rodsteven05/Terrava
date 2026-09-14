const cron = require('node-cron');
const { processOverdueAccounts } = require('../services/installmentService');

let task = null;

const start = () => {
  if (task) return;
  console.log('[Cron] Scheduling daily overdue installment check at 06:00');
  task = cron.schedule('0 6 * * *', async () => {
    console.log('[Cron] Running overdue installment check...');
    try {
      const result = await processOverdueAccounts();
      console.log(`[Cron] Overdue check complete. Processed ${result.processed} account(s).`);
    } catch (err) {
      console.error('[Cron] Overdue check failed:', err);
    }
  }, {
    scheduled: true,
    timezone: 'Asia/Manila'
  });
};

const stop = () => {
  if (task) {
    task.stop();
    task = null;
  }
};

module.exports = { start, stop };
