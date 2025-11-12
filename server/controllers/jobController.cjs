const Job = require('../Models/Job.cjs');

const jobController = {
  async getAllJobs(req, res) {
    try {
      const { page = 1, limit = 20, category, source, search } = req.query;
      const skip = (page - 1) * limit;

      const filter = {};
      if (category) filter.category = category;
      if (source) filter.source = source;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
        ];
      }

      const [jobs, total] = await Promise.all([
        Job.find(filter)
          .sort({ publishedDate: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .select('-rawData')
          .lean(),
        Job.countDocuments(filter),
      ]);

      res.status(200).json({
        success: true,
        data: jobs,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error('Error fetching jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jobs',
        error: error.message,
      });
    }
  },

  async getJobById(req, res) {
    try {
      const { id } = req.params;
      const job = await Job.findById(id).lean();

      if (!job) {
        return res.status(404).json({
          success: false,
          message: 'Job not found',
        });
      }

      res.status(200).json({
        success: true,
        data: job,
      });
    } catch (error) {
      console.error('Error fetching job:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job',
        error: error.message,
      });
    }
  },

  async getJobStats(req, res) {
    try {
      const [totalJobs, jobsBySource, jobsByCategory] = await Promise.all([
        Job.countDocuments(),
        Job.aggregate([
          { $group: { _id: '$source', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Job.aggregate([
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),
      ]);

      res.status(200).json({
        success: true,
        stats: {
          total: totalJobs,
          bySource: jobsBySource,
          byCategory: jobsByCategory,
        },
      });
    } catch (error) {
      console.error('Error fetching job stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch job stats',
        error: error.message,
      });
    }
  },
};

module.exports = jobController;
