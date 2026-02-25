'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Balance extends Model {
    static associate(models) {
      Balance.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
      Balance.belongsTo(models.User, { foreignKey: 'targetUserId', as: 'targetUser' });
    }
  }

  Balance.init({
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
    targetUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id',
      },
    },
    amount: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
      defaultValue: 0,
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
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
    modelName: 'Balance',
    timestamps: true,
  });

  return Balance;
};
