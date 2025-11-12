const jobQueue = require('../DB/queue.cjs');
const jobFetcher = require('../services/jobFetcher.cjs');
const ImportLog = require('../Models/ImportLog.cjs');

const importController = {
  async triggerImport(req, res) {
    try {
      const feedSources = jobFetcher.getFeedSources();
      const importJobs = [];

      for (const source of feedSources) {
        const importLog = await ImportLog.create({
          fileName: source.url,
          status: 'in_progress',
          timestamp: new Date(),
        });

        const job = await jobQueue.add({
          url: source.url,
          fileName: source.name,
          importLogId: importLog._id,
        });

        importJobs.push({
          jobId: job.id,
          source: source.name,
          importLogId: importLog._id,
        });
      }

      res.status(200).json({
        success: true,
        message: `Started import for ${feedSources.length} feed sources`,
        jobs: importJobs,
      });
    } catch (error) {
      console.error('Error triggering import:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to trigger import',
        error: error.message,
      });
    }
  },

  async getImportHistory(req, res) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const skip = (page - 1) * limit;

      const [logs, total] = await Promise.all([
        ImportLog.find()
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        ImportLog.countDocuments(),
      ]);

      res.status(200).json({
        success: true,
        data: logs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching import history:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch import history',
        error: error.message,
      });
    }
  },

  async getImportById(req, res) {
    try {
      const { id } = req.params;
      const importLog = await ImportLog.findById(id).lean();

      if (!importLog) {
        return res.status(404).json({
          success: false,
          message: 'Import log not found',
        });
      }

      res.status(200).json({
        success: true,
        data: importLog,
      });
    } catch (error) {
      console.error('Error fetching import log:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch import log',
        error: error.message,
      });
    }
  },

  async getQueueStats(req, res) {
    try {
      const [waiting, active, completed, failed] = await Promise.all([
        jobQueue.getWaitingCount(),
        jobQueue.getActiveCount(),
        jobQueue.getCompletedCount(),
        jobQueue.getFailedCount(),
      ]);

      res.status(200).json({
        success: true,
        stats: {
          waiting,
          active,
          completed,
          failed,
          total: waiting + active + completed + failed,
        },
      });
    } catch (error) {
      console.error('Error fetching queue stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch queue stats',
        error: error.message,
      });
    }
  },
};

module.exports = importController;
