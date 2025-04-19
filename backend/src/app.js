const express = require('express');
const cors = require('cors');
const Logger = require('./utils/logger');
const packageRoutes = require('./routes/packageRoutes');
const dockerRoutes = require('./routes/dockerRoutes');
const projectRoutes = require('./routes/projectRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', packageRoutes);
app.use('/api/docker', dockerRoutes);
app.use('/api', projectRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  Logger.error('Unhandled error', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
