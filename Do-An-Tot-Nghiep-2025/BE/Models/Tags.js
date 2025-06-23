const mongoose = require('mongoose');

// === Common Validators ===
const stringValidator = {
  validator: v => /^[\p{L}0-9\s,-]+$/u.test(v),
  message: props => `${props.value} chứa ký tự không hợp lệ.`
};

const seoStringValidator = {
  validator: v => !v || /^[\p{L}0-9\s,.-]+$/u.test(v),
  message: props => `${props.value} chứa ký tự không hợp lệ.`
};

const wordCountValidator = (min, max) => ({
  validator: function (v) {
    const wordCount = v.trim().split(/\s+/).length;
    return wordCount >= min && wordCount <= max;
  },
  message: props =>
    `${props.path} phải có từ ${min} đến ${max} từ (hiện tại: ${props.value.trim().split(/\s+/).length})`
});

// === Main Tag Schema ===
const TagSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: [stringValidator, wordCountValidator(1, 5)]
  },

  description: {
    type: String,
    trim: true,
    validate: wordCountValidator(1, 50)
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    required: true
  },

  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],

  seo: {
    keywords: {
      type: String,
      validate: seoStringValidator,
      default: ''
    },
    metaTitle: {
      type: String,
      validate: seoStringValidator,
      default: ''
    },
    metaDescription: {
      type: String,
      default: ''
    },
    urlSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      validate: stringValidator,
      default: function () {
        // Tạo urlSlug từ tên tag nếu không được cung cấp
        return this.parent().name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
      }
    }
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// === Middleware ===
TagSchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Đảm bảo urlSlug luôn có giá trị
  if (!this.seo.urlSlug) {
    this.seo.urlSlug = this.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Đảm bảo các trường SEO có giá trị mặc định
  if (!this.seo.keywords) {
    this.seo.keywords = this.name;
  }
  if (!this.seo.metaTitle) {
    this.seo.metaTitle = this.name;
  }
  if (!this.seo.metaDescription) {
    this.seo.metaDescription = this.description;
  }

  next();
});

TagSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() }); 
  next();
});

// === Text Index for Search ===
TagSchema.index({
  name: 'text',
  'seo.keywords': 'text'
});

// === Export ===
module.exports = mongoose.model('Tag', TagSchema);