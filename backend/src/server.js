#!/usr/bin/env node

require('dotenv').config();
const app = require('./app');
const config = require('./config');
const Logger = require('./utils/logger');

const { port, host } = config.server;

app.listen(port, host, () => {
  Logger.info(`Server running at http://${host}:${port}`);
});
