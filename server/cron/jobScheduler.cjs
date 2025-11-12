const cron = require('node-cron');
const jobQueue = require('../DB/queue.cjs');
const jobFetcher = require('../services/jobFetcher.cjs');
const ImportLog = require('../Models/ImportLog.cjs');

function startCronJob() {
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled job import...');
    
    try {
      const feedSources = jobFetcher.getFeedSources();

      for (const source of feedSources) {
        const importLog = await ImportLog.create({
          fileName: source.url,
          status: 'in_progress',
          timestamp: new Date(),
        });

        await jobQueue.add({
          url: source.url,
          fileName: source.name,
          importLogId: importLog._id,
        });

        console.log(`Scheduled job for: ${source.name}`);
      }
    } catch (error) {
      console.error('Error in scheduled job:', error.message);
    }
  });

  console.log('Cron job scheduled: Job import will run every hour');
}

module.exports = { startCronJob };
