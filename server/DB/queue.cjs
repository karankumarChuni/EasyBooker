const Queue = require('bull');
const redis = require('./redis.cjs');

const jobQueue = new Queue('job-import-queue', process.env.REDIS_URL || 'redis://localhost:6379', {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: 100,
    removeOnFail: 500,
  },
});

jobQueue.on('error', (error) => {
  console.error('Queue error:', error);
});

jobQueue.on('waiting', (jobId) => {
  console.log(`Job ${jobId} is waiting`);
});

jobQueue.on('active', (job) => {
  console.log(`Job ${job.id} has started`);
});

jobQueue.on('completed', (job) => {
  console.log(`Job ${job.id} has completed`);
});

jobQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} has failed:`, err.message);
});

module.exports = jobQueue;
