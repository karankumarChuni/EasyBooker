const jobQueue = require('../DB/queue.cjs');
const jobFetcher = require('../services/jobFetcher.cjs');
const jobProcessor = require('../services/jobProcessor.cjs');
const ImportLog = require('../Models/ImportLog.cjs');

jobQueue.process(5, async (job) => {
  const { url, fileName, importLogId } = job.data;
  
  console.log(`Processing job for: ${fileName}`);
  
  try {
    const startTime = Date.now();
    
    const jobs = await jobFetcher.fetchAndParseJobs(url, fileName);
    
    await ImportLog.findByIdAndUpdate(importLogId, {
      totalFetched: jobs.length,
    });

    const results = await jobProcessor.processJobs(jobs, importLogId);
    
    const duration = Date.now() - startTime;
    
    await ImportLog.findByIdAndUpdate(importLogId, {
      status: 'completed',
      duration,
    });

    return {
      success: true,
      fileName,
      totalFetched: jobs.length,
      ...results,
    };
  } catch (error) {
    console.error(`Worker error for ${fileName}:`, error.message);
    
    await ImportLog.findByIdAndUpdate(importLogId, {
      status: 'failed',
      error: error.message,
    });

    throw error;
  }
});

jobQueue.on('completed', (job, result) => {
  console.log(`Job completed: ${result.fileName} - New: ${result.new}, Updated: ${result.updated}, Failed: ${result.failed}`);
});

jobQueue.on('failed', (job, err) => {
  console.error(`Job failed: ${job.data.fileName} - ${err.message}`);
});

console.log('Job worker started and listening for jobs...');

module.exports = jobQueue;
