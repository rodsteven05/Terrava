module.exports = (sequelize, DataTypes) => {
  const InstallmentAccount = sequelize.define('InstallmentAccount', {
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
    total_contract_price: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false
    },
    reservation_fee: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    minimum_down_payment_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    down_payment_required: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    down_payment_paid: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    balance_for_monthly: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    monthly_payment_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    term_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    total_months: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 12
    },
    start_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    due_day_of_month: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    status: {
      type: DataTypes.ENUM('active', 'grace_period', 'overdue', 'delinquent', 'defaulted', 'paid_off'),
      defaultValue: 'active'
    },
    penalty_rate_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 5.00
    },
    total_paid: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_principal_paid: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_penalties_paid: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    total_penalties_applied: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    remaining_balance: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    next_due_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    last_payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    defaulted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    assigned_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'installment_accounts',
    timestamps: true,
    underscored: true
  });

  InstallmentAccount.associate = (models) => {
    InstallmentAccount.belongsTo(models.LandListing, { foreignKey: 'listing_id', as: 'listing' });
    InstallmentAccount.belongsTo(models.User, { foreignKey: 'buyer_id', as: 'buyer' });
    InstallmentAccount.belongsTo(models.User, { foreignKey: 'seller_id', as: 'seller' });
    InstallmentAccount.hasMany(models.MonthlyAmortization, { foreignKey: 'installment_account_id', as: 'amortizations' });
  };

  return InstallmentAccount;
};
