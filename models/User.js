'use strict';
const { Model, DataTypes } = require('sequelize');
const bcryptjs = require('bcryptjs');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      User.hasMany(models.Expense, { foreignKey: 'userId', as: 'expenses' });
      User.hasMany(models.ExpenseMember, { foreignKey: 'userId', as: 'expenseMembers' });
      User.hasMany(models.Balance, { foreignKey: 'userId', as: 'balances' });
      User.hasMany(models.ActivityLog, { foreignKey: 'userId', as: 'activityLogs' });
    }

    // Compare password method
    async comparePassword(password) {
      return bcryptjs.compare(password, this.password);
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      lowercase: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      defaultValue: '',
    },
    currency: {
      type: DataTypes.STRING,
      defaultValue: 'USD',
      validate: {
        len: [3, 3],
      },
    },
    profilePicture: {
      type: DataTypes.STRING,
      defaultValue: null,
    },
    phone: {
      type: DataTypes.STRING,
      defaultValue: null,
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
    modelName: 'User',
    timestamps: true,
    paranoid: true, // Enables soft delete
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcryptjs.genSalt(10);
          user.password = await bcryptjs.hash(user.password, salt);
        }
      },
    },
  });

  return User;
};
