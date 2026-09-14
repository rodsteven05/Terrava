const db = require('../models');
const { Op } = require('sequelize');
const { processOverdueAccounts, allocatePayment, createInstallmentAccount } = require('../services/installmentService');

const includeOpts = [
  { model: db.LandListing, as: 'listing', attributes: ['id', 'title', 'location_text', 'price', 'status', 'area_sqm', 'in_house_max_term_years'] },
  { model: db.User, as: 'buyer', attributes: ['id', 'full_name', 'email', 'phone', 'photo_url'] },
  { model: db.User, as: 'seller', attributes: ['id', 'full_name', 'email', 'phone', 'photo_url'] }
];

exports.getAll = async (req, res) => {
  try {
    const accounts = await db.InstallmentAccount.findAll({
      include: includeOpts,
      order: [['created_at', 'DESC']]
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMine = async (req, res) => {
  try {
    const where = req.user.role === 'seller'
      ? { seller_id: req.user.id }
      : { buyer_id: req.user.id };
    const accounts = await db.InstallmentAccount.findAll({
      where,
      include: includeOpts,
      order: [['created_at', 'DESC']]
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const account = await db.InstallmentAccount.findByPk(req.params.id, {
      include: [
        ...includeOpts,
        { model: db.MonthlyAmortization, as: 'amortizations', order: [['month_number', 'ASC']] }
      ]
    });
    if (!account) return res.status(404).json({ error: 'Installment account not found' });

    const isAuthorized = req.user.role === 'admin' ||
      account.buyer_id === req.user.id ||
      account.seller_id === req.user.id;
    if (!isAuthorized) return res.status(403).json({ error: 'Forbidden' });

    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePenaltyRate = async (req, res) => {
  try {
    const account = await db.InstallmentAccount.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'Installment account not found' });

    const isAuthorized = req.user.role === 'admin' || account.seller_id === req.user.id;
    if (!isAuthorized) return res.status(403).json({ error: 'Forbidden' });

    const rate = Number(req.body.penalty_rate_pct);
    if (Number.isNaN(rate) || rate < 0 || rate > 100) {
      return res.status(400).json({ error: 'Invalid penalty rate' });
    }

    await account.update({ penalty_rate_pct: rate });
    await db.MonthlyAmortization.update(
      { penalty_rate_pct: rate },
      { where: { installment_account_id: account.id, status: { [Op.ne]: 'paid' } } }
    );

    res.json({ message: 'Penalty rate updated', account });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.recordPayment = async (req, res) => {
  try {
    const account = await db.InstallmentAccount.findByPk(req.params.id);
    if (!account) return res.status(404).json({ error: 'Installment account not found' });

    const isAuthorized = req.user.role === 'admin' ||
      account.seller_id === req.user.id ||
      account.buyer_id === req.user.id;
    if (!isAuthorized) return res.status(403).json({ error: 'Forbidden' });

    const amount = Number(req.body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const result = await allocatePayment(account.id, amount);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.runOverdueCheck = async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });
    const result = await processOverdueAccounts();
    res.json({ message: 'Overdue check complete', processed: result.processed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createFromListing = async (req, res) => {
  try {
    const listing = await db.LandListing.findByPk(req.params.listingId);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    if (!listing.assigned_buyer_id) return res.status(400).json({ error: 'No buyer assigned to listing' });

    const isAuthorized = req.user.role === 'admin' || listing.seller_id === req.user.id;
    if (!isAuthorized) return res.status(403).json({ error: 'Forbidden' });

    const existing = await db.InstallmentAccount.findOne({
      where: { listing_id: listing.id, status: { [Op.ne]: 'defaulted' } }
    });
    if (existing) return res.status(400).json({ error: 'Active installment account already exists' });

    const startDate = req.body.start_date || new Date().toISOString().slice(0, 10);
    const account = await createInstallmentAccount(listing, listing.assigned_buyer_id, startDate);
    res.json(account);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
