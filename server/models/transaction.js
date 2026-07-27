module.exports = (sequelize, DataTypes) => {
  const Transaction = sequelize.define('Transaction', {
    listing_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    buyer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    seller_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false
    },
    payment_method: {
      type: DataTypes.ENUM('bank_transfer', 'cash', 'check', 'ewallet'),
      allowNull: false
    },
    reference_number: DataTypes.STRING(255),
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected'),
      defaultValue: 'pending'
    },
    recorded_by: DataTypes.INTEGER,
    eth_tx_hash: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    tableName: 'transactions',
    timestamps: true,
    underscored: true
  });

  Transaction.associate = (models) => {
    Transaction.belongsTo(models.LandListing, { foreignKey: 'listing_id', as: 'listing' });
    Transaction.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'buyer' });
    Transaction.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
    Transaction.belongsTo(models.User, { foreignKey: 'recorded_by', as: 'recorder' });
    Transaction.hasOne(models.Block, { foreignKey: 'transaction_id', as: 'block' });
  };

  return Transaction;
};
