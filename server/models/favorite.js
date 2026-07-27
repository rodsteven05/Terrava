module.exports = (sequelize, DataTypes) => {
  const Favorite = sequelize.define('Favorite', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'favorites',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['user_id', 'listing_id'] }
    ]
  });

  Favorite.associate = (models) => {
    Favorite.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    Favorite.belongsTo(models.LandListing, { foreignKey: 'listing_id', as: 'listing' });
  };

  return Favorite;
};
