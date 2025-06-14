const mongoose = require('mongoose');

// === Common Validators ===
const stringValidator = {
  validator: v => /^[\p{L}0-9\s,.'-]+$/u.test(v),
  message: props => `${props.path} chứa ký tự không hợp lệ.`
};

const wordCountValidator = (min, max) => ({
  validator: function (v) {
    const count = v.trim().split(/\s+/).length;
    return count >= min && count <= max;
  },
  message: props =>
    `${props.path} phải có từ ${min} đến ${max} từ (hiện tại: ${props.value.trim().split(/\s+/).length})`
});

const emailValidator = {
  validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  message: props => `${props.value} không phải là địa chỉ email hợp lệ.`
};

const phoneValidator = {
  validator: v => /^0\d{9,10}$/.test(v),
  message: props => `${props.value} không phải là số điện thoại hợp lệ.`
};

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100,
    validate: [
      stringValidator,
      wordCountValidator(2, 10)
    ]
  },
  gender: {
    type: String,
    enum: ['Nam', 'Nữ', 'Khác'],
    default: 'Khác'
  },
  skinType: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50,
    validate: [stringValidator]
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    validate: emailValidator
  },
  passwordHash: {
    type: String,
    required: true,
    minlength: 60 // độ dài hash bcrypt (thường ~60 ký tự)
  },
  phone: {
    type: String,
    required: true,
    validate: phoneValidator
  },
  address: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 300,
    validate: stringValidator
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    required: true
  },
  orderIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
