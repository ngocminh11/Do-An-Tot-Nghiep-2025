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
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 200,
    validate: [
      stringValidator,
      wordCountValidator(2, 10)
    ]
  },
  description: {
    type: String,
    default: '',
    trim: true,
    maxlength: 3000, 
    validate: [wordCountValidator(0, 50)]
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 200,
    validate: [stringValidator]
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

CategorySchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

CategorySchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);
