const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 150,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: /^[a-z0-9]+(?:-[a-z0-9]+)*$/, // ví dụ: huong-dan-trang-diem
  },
  excerpt: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300,
  },
  content: {
    type: String,
    required: true,
    minlength: 20,
  },
  thumbnail: {
    fileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Media', default: null },
    url: { type: String, default: null }
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  tags: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tag',
  }],
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft',
  },
  publishedAt: {
    type: Date,
  },
  viewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  seo: {
    title: { type: String, maxlength: 60 },
    description: { type: String, maxlength: 160 },
    keywords: [{ type: String, maxlength: 50 }],
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isPinned: {
    type: Boolean,
    default: false,
  },
  isCommentEnabled: {
    type: Boolean,
    default: true,
  },
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Post', postSchema);
