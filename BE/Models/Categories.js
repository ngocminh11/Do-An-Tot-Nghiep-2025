const mongoose = require('mongoose');

// === Common Validators ===
const stringValidator = {
  validator: v => /^[\p{L}0-9\s,-]+$/u.test(v),
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

const CategorySchema = new mongoose.Schema({
  idCategory: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  slug: { type: String, required: true, unique: true, trim: true },
  status: {
    type: String,
    enum: {
      values: ['active', 'inactive', 'archived'],
      message: 'Trạng thái không hợp lệ'
    },
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

CategorySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

CategorySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Indexes
CategorySchema.index({ name: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ status: 1 });

module.exports = mongoose.model('Category', CategorySchema);
