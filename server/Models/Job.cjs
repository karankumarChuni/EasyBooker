const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
  },
  location: {
    type: String,
  },
  jobType: {
    type: String,
  },
  category: {
    type: String,
  },
  description: {
    type: String,
  },
  url: {
    type: String,
  },
  publishedDate: {
    type: Date,
  },
  source: {
    type: String,
    required: true,
  },
  rawData: {
    type: mongoose.Schema.Types.Mixed,
  },
}, {
  timestamps: true,
});

jobSchema.index({ jobId: 1 });
jobSchema.index({ source: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ publishedDate: -1 });

module.exports = mongoose.model('Job', jobSchema);
