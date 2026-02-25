'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class ExpenseMember extends Model {
    static associate(models) {
      ExpenseMember.belongsTo(models.Expense, { foreignKey: 'expenseId', as: 'expense' });
      ExpenseMember.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    }
  }

  ExpenseMember.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    expenseId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Expenses',
        key: 'id',
      },
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    shareAmount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    shareType: {
      type: DataTypes.ENUM('equal', 'percentage', 'amount'),
      defaultValue: 'equal',
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
  }, {
    sequelize,
    modelName: 'ExpenseMember',
    timestamps: true,
  });

  return ExpenseMember;
};
