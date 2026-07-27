module.exports = (sequelize, DataTypes) => {
  const Inquiry = sequelize.define('Inquiry', {
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    reply: DataTypes.TEXT,
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'inquiries',
    timestamps: true,
    underscored: true
  });

  Inquiry.associate = (models) => {
    Inquiry.belongsTo(models.LandListing, { foreignKey: 'listing_id', as: 'listing' });
    Inquiry.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'buyer' });
  };

  return Inquiry;
};
