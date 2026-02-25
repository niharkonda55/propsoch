const nodemailer = require('nodemailer');
const { User, Balance } = require('../models');
const { Op } = require('sequelize');

class EmailService {
  static async initializeTransporter() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  /**
   * Send monthly balance report to a user
   */
  static async sendMonthlyReport(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) return;

      // Get all balances for this user
      const balances = await Balance.findAll({
        where: {
          [Op.or]: [
            { userId },
            { targetUserId: userId },
          ],
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'email'],
          },
          {
            model: User,
            as: 'targetUser',
            attributes: ['name', 'email'],
          },
        ],
      });

      // Format balance details
      let balanceHtml = '<h3>Your Balances</h3><ul>';
      let totalOwed = 0;
      let totalOwes = 0;

      balances.forEach(balance => {
        if (balance.userId === userId) {
          // User owes
          balanceHtml += `<li>${balance.targetUser.name}: ${balance.currency} ${balance.amount}</li>`;
          totalOwes += parseFloat(balance.amount);
        } else {
          // User is owed
          balanceHtml += `<li>${balance.user.name} owes you: ${balance.currency} ${balance.amount}</li>`;
          totalOwed += parseFloat(balance.amount);
        }
      });

      balanceHtml += '</ul>';

      const emailHtml = `
        <h2>Splitwise Monthly Report</h2>
        <p>Hello ${user.name},</p>
        <p>Here's your monthly balance summary:</p>
        ${balanceHtml}
        <p><strong>Total amount you owe: ${totalOwes}</strong></p>
        <p><strong>Total amount owed to you: ${totalOwed}</strong></p>
        <p>Log in to Splitwise to view more details and settle balances.</p>
        <p>Best regards,<br>Splitwise Team</p>
      `;

      const transporter = await this.initializeTransporter();
      
      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: 'Your Splitwise Monthly Balance Report',
        html: emailHtml,
      });

      console.log(`Monthly report sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending monthly report:', error);
    }
  }

  /**
   * Send all monthly reports (can be run by cron job)
   */
  static async sendAllMonthlyReports() {
    try {
      const users = await User.findAll({
        attributes: ['id'],
      });

      for (const user of users) {
        await this.sendMonthlyReport(user.id);
      }

      console.log('All monthly reports sent');
    } catch (error) {
      console.error('Error sending monthly reports:', error);
    }
  }

  /**
   * Send balance notification
   */
  static async sendBalanceNotification(userId, otherUserId, amount) {
    try {
      const user = await User.findByPk(userId);
      const otherUser = await User.findByPk(otherUserId);

      if (!user || !otherUser) return;

      const transporter = await this.initializeTransporter();

      const emailHtml = `
        <h2>Balance Update</h2>
        <p>Hello ${user.name},</p>
        <p>Your balance with ${otherUser.name} has been updated.</p>
        <p>You now owe: ${amount}</p>
        <p>Log in to view your full balance details.</p>
        <p>Best regards,<br>Splitwise Team</p>
      `;

      await transporter.sendMail({
        from: process.env.MAIL_FROM,
        to: user.email,
        subject: 'Your Splitwise Balance Has Been Updated',
        html: emailHtml,
      });

      console.log(`Balance notification sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending balance notification:', error);
    }
  }
}

module.exports = EmailService;
