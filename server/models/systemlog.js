module.exports = (sequelize, DataTypes) => {
  const SystemLog = sequelize.define('SystemLog', {
    user_id: DataTypes.INTEGER,
    action: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    details: DataTypes.TEXT
  }, {
    tableName: 'system_logs',
    timestamps: true,
    underscored: true
  });

  SystemLog.associate = (models) => {
    SystemLog.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  };

  return SystemLog;
};
