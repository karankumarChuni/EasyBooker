const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./DB/connection.cjs');
const importRoutes = require('./Routes/importRoutes.cjs');
const jobRoutes = require('./Routes/jobRoutes.cjs');
const errorHandler = require('./middleware/errorHandler.cjs');
const logger = require('./middleware/logger.cjs');
const { startCronJob } = require('./cron/jobScheduler.cjs');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger);

connectDB();

require('./workers/jobWorker.cjs');

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/import', importRoutes);
app.use('/api/jobs', jobRoutes);

app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  startCronJob();
});

module.exports = app;
