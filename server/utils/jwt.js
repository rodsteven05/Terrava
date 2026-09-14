const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'terrava_jwt_secret_2026';

exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

exports.generateLedgerToken = (payload) => {
  return jwt.sign({ ...payload, purpose: 'blockchain-ledger' }, JWT_SECRET, { expiresIn: '15m' });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
