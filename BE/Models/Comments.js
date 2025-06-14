const mongoose = require('mongoose');

// === Validators ===
const contentValidator = {
  validator: v => /^[\p{L}0-9\s,.'?!\-()@#$%&*":;/\\\[\]]+$/u.test(v),
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

const commentSchema = new mongoose.Schema({
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: true
},
productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
    },
content: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 1000,
    validate: [
      contentValidator,
      wordCountValidator(1, 100)
    ]
  },
rating: {
    type: Number,
    min: 1,
    max: 5
  },
reply: {
  content: {
    type: String,
    trim: true,
    maxlength: 10000
  },
  repliedAt: {
    type: Date
  }
},
images: [{
    type: String, // URL
  }],
status: {
    type: String,
    enum: ['visible', 'hidden', 'pending'],
    default: 'visible'
  }
},
 {
timestamps: true
});

module.exports = mongoose.model('Comment', commentSchema);
