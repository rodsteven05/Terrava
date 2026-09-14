module.exports = (sequelize, DataTypes) => {
  const LandListing = sequelize.define('LandListing', {
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: DataTypes.TEXT,
    price: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false
    },
    area_sqm: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('available', 'reserved', 'sold'),
      defaultValue: 'available'
    },
    location_text: DataTypes.STRING(500),
    branch: {
      type: DataTypes.ENUM('Main Tagum', 'Panabo', 'Sto. Tomas', 'Davao City', 'Mati City', 'Digos City'),
      allowNull: true
    },
    polygon_geojson: {
      type: DataTypes.JSONB,
      allowNull: true
    },
    photos: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    photo_geotags: {
      type: DataTypes.JSONB,
      defaultValue: []
    },
    is_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    assigned_buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    zoning_classification: DataTypes.STRING(100),
    land_title_status: DataTypes.STRING(100),
    total_contract_price: DataTypes.DECIMAL(18, 2),
    reservation_fee: DataTypes.DECIMAL(18, 2),
    minimum_down_payment_pct: DataTypes.STRING(10),
    cash_term_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    cash_term_discount_pct: DataTypes.DECIMAL(5, 2),
    in_house_financing_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    in_house_max_term_years: DataTypes.INTEGER,
    in_house_interest_rate_pct: DataTypes.DECIMAL(5, 2),
    bank_government_loan_enabled: { type: DataTypes.BOOLEAN, defaultValue: false },
    penalty_rate_pct: {
      type: DataTypes.DECIMAL(5, 2),
      defaultValue: 5.00
    },
    monthly_payment_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: true
    },
    terrain_topography: DataTypes.STRING(100),
    lot_configuration: DataTypes.STRING(100),
    utilities: { type: DataTypes.JSONB, defaultValue: {} },
    lot_block_number: DataTypes.STRING(100)
  }, {
    tableName: 'land_listings',
    timestamps: true,
    underscored: true
  });

  LandListing.associate = (models) => {
    LandListing.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
    LandListing.belongsTo(models.User, { foreignKey: 'assigned_buyer_id', as: 'assignedBuyer' });
    LandListing.hasMany(models.Inquiry, { foreignKey: 'listing_id', as: 'inquiries' });
    LandListing.hasMany(models.Transaction, { foreignKey: 'listing_id', as: 'transactions' });
    LandListing.hasMany(models.Favorite, { foreignKey: 'listing_id', as: 'favorites' });
    LandListing.hasMany(models.InstallmentAccount, { foreignKey: 'listing_id', as: 'installmentAccounts' });
  };

  return LandListing;
};
