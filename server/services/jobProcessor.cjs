const Job = require('../Models/Job.cjs');
const ImportLog = require('../Models/ImportLog.cjs');

class JobProcessor {
  async processJobs(jobs, importLogId) {
    const results = {
      new: 0,
      updated: 0,
      failed: 0,
      failedDetails: [],
    };

    for (const jobData of jobs) {
      try {
        const existingJob = await Job.findOne({ jobId: jobData.jobId });

        if (existingJob) {
          await Job.findByIdAndUpdate(existingJob._id, jobData, { new: true });
          results.updated++;
        } else {
          await Job.create(jobData);
          results.new++;
        }
      } catch (error) {
        results.failed++;
        results.failedDetails.push({
          jobId: jobData.jobId || 'unknown',
          reason: error.message,
          errorDetails: error.stack,
        });
        console.error(`Failed to process job ${jobData.jobId}:`, error.message);
      }
    }

    if (importLogId) {
      await ImportLog.findByIdAndUpdate(importLogId, {
        newJobs: results.new,
        updatedJobs: results.updated,
        failedJobs: results.failed,
        failedJobDetails: results.failedDetails,
        totalImported: results.new + results.updated,
      });
    }

    return results;
  }

  async validateJob(jobData) {
    if (!jobData.jobId) {
      throw new Error('Job ID is required');
    }
    if (!jobData.title) {
      throw new Error('Job title is required');
    }
    if (!jobData.source) {
      throw new Error('Job source is required');
    }
    return true;
  }
}

module.exports = new JobProcessor();
