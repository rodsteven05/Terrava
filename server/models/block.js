module.exports = (sequelize, DataTypes) => {
  const Block = sequelize.define('Block', {
    index: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    transaction_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    transaction_data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    previous_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    nonce: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  }, {
    tableName: 'blocks',
    timestamps: true,
    underscored: true
  });

  Block.associate = (models) => {
    Block.belongsTo(models.Transaction, { foreignKey: 'transaction_id', as: 'transaction' });
  };

  return Block;
};
