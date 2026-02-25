require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

// Import routes
const userRoutes = require('./routes/users');
const expenseRoutes = require('./routes/expenses');
const balanceRoutes = require('./routes/balances');
const activityLogRoutes = require('./routes/activityLogs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Splitwise API is running' });
});

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/balances', balanceRoutes);
app.use('/api/activity-logs', activityLogRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Initialize database and start server
async function initializeAndStart() {
  try {
    // Sync database
    await sequelize.sync({ alter: false });
    console.log('Database synced successfully');

    // Start server
    app.listen(PORT, () => {
      console.log(`Splitwise API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

initializeAndStart();

module.exports = app;
