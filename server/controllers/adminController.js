const db = require('../models');
const { Op } = require('sequelize');
const { hashPassword } = require('../utils/password');

const BRANCHES = ['Main Tagum', 'Panabo', 'Sto. Tomas', 'Davao City', 'Mati City', 'Digos City'];

const validatePassword = (password) => {
  if (!password || password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return 'Password must contain at least one number or special character';
  return '';
};

exports.createSeller = async (req, res) => {
  try {
    const {
      email, password, first_name, middle_name, last_name, extension_name,
      phone, phone2, birthdate, address, occupation, branch,
      spouse_first_name, spouse_middle_name, spouse_last_name, spouse_extension_name,
      spouse_email, spouse_phone, spouse_occupation
    } = req.body;

    if (!first_name?.trim() || !last_name?.trim() || !email?.trim() || !phone?.trim() || !birthdate || !address?.trim() || !occupation?.trim()) {
      return res.status(400).json({ error: 'Complete the required seller profile fields.' });
    }
    if (!BRANCHES.includes(branch)) return res.status(400).json({ error: 'Select a valid branch assignment.' });

    const passwordError = validatePassword(password);
    if (passwordError) return res.status(400).json({ error: passwordError });

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.User.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const full_name = [first_name, middle_name, last_name, extension_name].filter(Boolean).join(' ');
    const seller = await db.User.create({
      email: normalizedEmail,
      password_hash: await hashPassword(password),
      full_name,
      first_name: first_name.trim(),
      middle_name: middle_name?.trim() || null,
      last_name: last_name.trim(),
      extension_name: extension_name?.trim() || null,
      role: 'seller',
      branch,
      phone: phone.trim(),
      phone2: phone2?.trim() || null,
      birthdate,
      address: address.trim(),
      occupation: occupation.trim(),
      spouse_first_name: spouse_first_name?.trim() || null,
      spouse_middle_name: spouse_middle_name?.trim() || null,
      spouse_last_name: spouse_last_name?.trim() || null,
      spouse_extension_name: spouse_extension_name?.trim() || null,
      spouse_email: spouse_email?.trim().toLowerCase() || null,
      spouse_phone: spouse_phone?.trim() || null,
      spouse_occupation: spouse_occupation?.trim() || null
    });

    res.status(201).json({
      user: {
        id: seller.id, email: seller.email, full_name: seller.full_name, role: seller.role,
        phone: seller.phone, branch: seller.branch, created_at: seller.created_at
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const where = req.query.role ? { role: req.query.role } : {};
    if (req.query.archived === 'true') {
      where.archived = true;
    } else if (req.query.archived === 'false' || !('archived' in req.query)) {
      where.archived = false;
    }
    const users = await db.User.findAll({
      where,
      attributes: [
        'id', 'email', 'full_name', 'role', 'phone', 'phone2', 'birthdate', 'address', 'branch', 'occupation',
        'first_name', 'middle_name', 'last_name', 'extension_name',
        'spouse_first_name', 'spouse_middle_name', 'spouse_last_name', 'spouse_extension_name',
        'spouse_email', 'spouse_phone', 'spouse_occupation', 'photo_url', 'archived', 'created_at'
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBuyers = async (req, res) => {
  try {
    const { search } = req.query;
    const where = { role: 'buyer' };
    if (search) {
      where[Op.or] = [
        { full_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    const buyers = await db.User.findAll({
      where,
      attributes: [
        'id', 'email', 'full_name', 'role', 'phone', 'created_at',
        'first_name', 'middle_name', 'last_name', 'extension_name',
        'phone2', 'birthdate', 'address', 'photo_url'
      ],
      order: [['full_name', 'ASC']]
    });
    res.json(buyers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.archiveUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ error: 'Cannot archive admin accounts' });
    await user.update({ archived: true });
    res.json({ message: 'User archived' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreUser = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ archived: false });
    res.json({ message: 'User restored' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const user = await db.User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await user.update({ role: req.body.role });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const [users, listings, transactions, inquiries] = await Promise.all([
      db.User.count(),
      db.LandListing.count(),
      db.Transaction.count(),
      db.Inquiry.count()
    ]);

    const totalSales = await db.Transaction.sum('amount', { where: { status: 'verified' } }) || 0;
    const pendingListings = await db.LandListing.count({ where: { is_verified: false } });

    res.json({
      users,
      listings,
      verifiedListings: await db.LandListing.count({ where: { is_verified: true } }),
      pendingListings,
      transactions,
      totalSales,
      inquiries
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSalesReport = async (req, res) => {
  try {
    const transactions = await db.Transaction.findAll({
      where: { status: 'verified' },
      include: [
        { model: db.LandListing, as: 'listing', attributes: ['id', 'title'] },
        { model: db.User, as: 'buyer', attributes: ['id', 'full_name', 'photo_url'] },
        { model: db.User, as: 'seller', attributes: ['id', 'full_name', 'photo_url'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.archiveListing = async (req, res) => {
  try {
    const listing = await db.LandListing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    await listing.update({ archived: true });
    res.json({ message: 'Listing archived' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.restoreListing = async (req, res) => {
  try {
    const listing = await db.LandListing.findByPk(req.params.id);
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    await listing.update({ archived: false });
    res.json({ message: 'Listing restored' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
