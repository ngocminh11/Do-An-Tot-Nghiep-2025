const mongoose = require('mongoose');

const productLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  action: {
    type: String,
    enum: ['CREATE', 'UPDATE', 'IMPORT', 'DELETE', 'STATUS'],
    required: true
  },
  operatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Nếu có bảng User, nếu không thì chỉ là ID dạng ObjectId
    default: null
  },
  payload: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProductLog', productLogSchema);
