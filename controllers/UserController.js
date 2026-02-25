const { User } = require('../models');
const { validationResult } = require('express-validator');

class UserController {
  /**
   * Create a new user account
   * POST /api/users/register
   */
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, name, currency } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already registered' });
      }

      // Create new user
      const user = await User.create({
        email,
        password,
        name: name || '',
        currency: currency || 'USD',
      });

      return res.status(201).json({
        message: 'User registered successfully',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Get user profile
   * GET /api/users/:userId
   */
  static async getProfile(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'email', 'name', 'currency', 'profilePicture', 'phone', 'createdAt'],
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ data: user });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Update user profile
   * PUT /api/users/:userId
   */
  static async updateProfile(req, res) {
    try {
      const { userId } = req.params;
      const { name, email, currency, phone, profilePicture } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Check if email is already taken by another user
      if (email && email !== user.email) {
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(409).json({ message: 'Email already in use' });
        }
      }

      // Update user
      if (name) user.name = name;
      if (email) user.email = email;
      if (currency) user.currency = currency;
      if (phone) user.phone = phone;
      if (profilePicture) user.profilePicture = profilePicture;

      await user.save();

      return res.status(200).json({
        message: 'Profile updated successfully',
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          currency: user.currency,
          phone: user.phone,
          profilePicture: user.profilePicture,
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Change user password
   * POST /api/users/:userId/change-password
   */
  static async changePassword(req, res) {
    try {
      const { userId } = req.params;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Current and new passwords are required' });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Verify current password
      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      user.password = newPassword;
      await user.save();

      return res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }

  /**
   * Delete user account
   * DELETE /api/users/:userId
   */
  static async deleteAccount(req, res) {
    try {
      const { userId } = req.params;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Soft delete
      await user.destroy();

      return res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Server error', error: error.message });
    }
  }
}

module.exports = UserController;
