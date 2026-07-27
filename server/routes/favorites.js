const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { getFavorites, checkFavorite, addFavorite, removeFavorite } = require('../controllers/favoriteController');

router.get('/', authenticate, authorize('buyer', 'admin'), getFavorites);
router.get('/:id', authenticate, authorize('buyer', 'admin'), checkFavorite);
router.post('/:id', authenticate, authorize('buyer', 'admin'), addFavorite);
router.delete('/:id', authenticate, authorize('buyer', 'admin'), removeFavorite);

module.exports = router;
