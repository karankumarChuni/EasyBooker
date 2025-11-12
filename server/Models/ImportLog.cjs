const mongoose = require('mongoose');

const failedJobSchema = new mongoose.Schema({
  jobId: String,
  reason: String,
  errorDetails: String,
}, { _id: false });

const importLogSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'failed'],
    default: 'in_progress',
  },
  totalFetched: {
    type: Number,
    default: 0,
  },
  totalImported: {
    type: Number,
    default: 0,
  },
  newJobs: {
    type: Number,
    default: 0,
  },
  updatedJobs: {
    type: Number,
    default: 0,
  },
  failedJobs: {
    type: Number,
    default: 0,
  },
  failedJobDetails: [failedJobSchema],
  duration: {
    type: Number,
  },
  error: {
    type: String,
  },
}, {
  timestamps: true,
});

importLogSchema.index({ timestamp: -1 });
importLogSchema.index({ fileName: 1 });

module.exports = mongoose.model('ImportLog', importLogSchema);
