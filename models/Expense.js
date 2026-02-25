'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Expense extends Model {
    static associate(models) {
      Expense.belongsTo(models.User, { foreignKey: 'userId', as: 'createdBy' });
      Expense.hasMany(models.ExpenseMember, { foreignKey: 'expenseId', as: 'members' });
      Expense.hasMany(models.ActivityLog, { foreignKey: 'expenseId', as: 'activityLogs' });
    }
  }

  Expense.init({
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
      validate: {
        len: [3, 3],
      },
    },
    description: {
      type: DataTypes.TEXT,
      defaultValue: '',
    },
    expenseDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    category: {
      type: DataTypes.STRING,
      defaultValue: 'Other',
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deletedAt: {
      type: DataTypes.DATE,
      defaultValue: null,
    },
  }, {
    sequelize,
    modelName: 'Expense',
    timestamps: true,
    paranoid: true, // Enables soft delete
  });

  return Expense;
};
