const db = require('../models');

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await db.Favorite.findAll({
      where: { user_id: req.user.id },
      include: [
        {
          model: db.LandListing,
          as: 'listing',
          where: { archived: false },
          required: true,
          include: [{ model: db.User, as: 'seller', attributes: ['id', 'full_name', 'email', 'phone', 'photo_url'] }]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(favorites.map((f) => f.listing));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.checkFavorite = async (req, res) => {
  try {
    const favorite = await db.Favorite.findOne({
      where: { user_id: req.user.id, listing_id: req.params.id }
    });
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.addFavorite = async (req, res) => {
  try {
    const listing = await db.LandListing.findByPk(req.params.id);
    if (!listing || listing.archived) return res.status(404).json({ error: 'Listing not found' });
    await db.Favorite.findOrCreate({
      where: { user_id: req.user.id, listing_id: req.params.id }
    });
    res.json({ message: 'Added to favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.removeFavorite = async (req, res) => {
  try {
    await db.Favorite.destroy({
      where: { user_id: req.user.id, listing_id: req.params.id }
    });
    res.json({ message: 'Removed from favorites' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
