const mongoose = require('mongoose');

const feedSourceSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastFetched: {
    type: Date,
  },
  fetchInterval: {
    type: Number,
    default: 3600000,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('FeedSource', feedSourceSchema);
