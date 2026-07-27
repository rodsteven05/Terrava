const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'landchain_jwt_secret_2026';

exports.generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

exports.verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
