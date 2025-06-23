const mongoose = require('mongoose');

const stringValidator = {
  validator: v => /^[\p{L}0-9\s,.'-]+$/u.test(v),
  message: props => `${props.path} chứa ký tự không hợp lệ.`
};

const promotionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
    validate: [stringValidator]
  },
  description: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  promoCode: {
    type: String,
    trim: true,
    unique: true,
    sparse: true // để code có thể để trống với promotion không dùng mã
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function (v) {
        return v > this.startDate;
      },
      message: 'endDate phải lớn hơn startDate'
    }
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  usageLimit: {
    type: Number,
    min: 1,
    default: 1
  },
  usedCount: {
    type: Number,
    default: 0
  },
  minOrderValue: {
    type: Number,
    min: 0,
    default: 0
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'scheduled', 'disabled'],
    default: 'scheduled'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Promotion', promotionSchema);