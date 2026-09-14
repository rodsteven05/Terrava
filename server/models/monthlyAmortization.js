module.exports = (sequelize, DataTypes) => {
  const MonthlyAmortization = sequelize.define('MonthlyAmortization', {
    installment_account_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    month_number: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    due_date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    principal_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    penalty_amount: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    penalty_rate_pct: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true
    },
    amount_paid: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    principal_paid: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    penalty_paid: {
      type: DataTypes.DECIMAL(18, 2),
      allowNull: false,
      defaultValue: 0
    },
    status: {
      type: DataTypes.ENUM('upcoming', 'grace_period', 'overdue', 'delinquent', 'defaulted', 'paid', 'waived'),
      defaultValue: 'upcoming'
    },
    days_overdue: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    reminder_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    warning_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    demand_letter_sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'monthly_amortizations',
    timestamps: true,
    underscored: true
  });

  MonthlyAmortization.associate = (models) => {
    MonthlyAmortization.belongsTo(models.InstallmentAccount, { foreignKey: 'installment_account_id', as: 'account' });
  };

  return MonthlyAmortization;
};
