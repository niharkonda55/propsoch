'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ActivityLog extends Model {
    static associate(models) {
      ActivityLog.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      ActivityLog.belongsTo(models.Expense, { foreignKey: 'expenseId', as: 'expense' });
    }
  }

  ActivityLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    expenseId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Expenses',
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM('created', 'updated', 'deleted', 'added_member'),
      allowNull: false,
    },
    actionDetails: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  }, {
    sequelize,
    modelName: 'ActivityLog',
    timestamps: false,
  });

  return ActivityLog;
};
