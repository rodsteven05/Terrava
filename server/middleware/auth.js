const { verifyToken } = require('../utils/jwt');
const db = require('../models');

exports.authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const user = await db.User.findByPk(decoded.id);
    if (!user) return res.status(401).json({ error: 'User not found' });

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};

exports.requireLedgerAccess = (req, res, next) => {
  try {
    const ledgerAuthorization = req.headers['x-ledger-authorization'];
    if (!ledgerAuthorization || !ledgerAuthorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Ledger password verification is required' });
    }

    const ledgerToken = ledgerAuthorization.split(' ')[1];
    const decoded = verifyToken(ledgerToken);
    if (decoded.purpose !== 'blockchain-ledger' || decoded.id !== req.user.id || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Invalid ledger access token' });
    }

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Ledger access has expired. Enter your password again.' });
  }
};
