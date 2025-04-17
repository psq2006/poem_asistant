const mongoose = require('mongoose');

const poemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  author: {
    type: String,
    required: true,
    index: true
  },
  dynasty: {
    type: String,
    required: true,
    index: true
  },
  content: {
    type: String,
    required: true
  },
  translation: String,
  background: String,
  authorInfo: {
    name: String,
    dynasty: String,
    life: String,
    style: String,
    representativeWorks: [String]
  },
  imageryAnalysis: {
    words: [String],
    emotions: [{
      word: String,
      emotion: String,
      explanation: String
    }]
  },
  lastRecommended: {
    type: Date,
    default: null
  },
  recommendationCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    index: true
  }]
}, {
  timestamps: true
});

// 创建索引
poemSchema.index({ title: 1, author: 1 }, { unique: true });
poemSchema.index({ tags: 1 });
poemSchema.index({ lastRecommended: 1 });

module.exports = mongoose.model('Poem', poemSchema); 