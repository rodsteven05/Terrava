module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true }
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    first_name: DataTypes.STRING(100),
    middle_name: DataTypes.STRING(100),
    last_name: DataTypes.STRING(100),
    extension_name: DataTypes.STRING(20),
    role: {
      type: DataTypes.ENUM('buyer', 'seller', 'admin'),
      allowNull: false,
      defaultValue: 'buyer'
    },
    phone: DataTypes.STRING(50),
    phone2: DataTypes.STRING(50),
    birthdate: DataTypes.DATEONLY,
    address: DataTypes.TEXT,
    branch: DataTypes.STRING(100),
    occupation: DataTypes.STRING(150),
    spouse_first_name: DataTypes.STRING(100),
    spouse_middle_name: DataTypes.STRING(100),
    spouse_last_name: DataTypes.STRING(100),
    spouse_extension_name: DataTypes.STRING(20),
    spouse_email: DataTypes.STRING(255),
    spouse_phone: DataTypes.STRING(50),
    spouse_occupation: DataTypes.STRING(150),
    photo_url: DataTypes.STRING(255),
    archived: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    User.hasMany(models.LandListing, { foreignKey: 'seller_id', as: 'listings' });
    User.hasMany(models.Inquiry, { foreignKey: 'buyer_id', as: 'inquiries' });
    User.hasMany(models.Transaction, { foreignKey: 'buyer_id', as: 'buyerTransactions' });
    User.hasMany(models.Transaction, { foreignKey: 'seller_id', as: 'sellerTransactions' });
    User.hasMany(models.Favorite, { foreignKey: 'user_id', as: 'favorites' });
    User.hasMany(models.Notification, { foreignKey: 'user_id', as: 'notifications' });
    User.hasMany(models.InstallmentAccount, { foreignKey: 'buyer_id', as: 'buyerAccounts' });
    User.hasMany(models.InstallmentAccount, { foreignKey: 'seller_id', as: 'sellerAccounts' });
  };

  return User;
};
