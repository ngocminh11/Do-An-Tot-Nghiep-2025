// models/Orders.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: { type: String, required: true },
      unit: { type: String, required: true },
      currency: { type: String, default: 'VND' },
      quantity: { type: Number, required: true, min: 1 },
      price: { type: Number, required: true, min: 0 },
      discount: { type: Number, default: 0 },
    }
  ],
  totalAmount: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ['Chờ xác nhận', 'Xác nhận', 'Đang giao hàng', 'Đã hoàn thành', 'Hủy'],
    default: 'Chờ xác nhận',
  },
  statusHistory: [
    {
      status: {
        type: String,
        enum: ['Chờ xác nhận', 'Xác nhận', 'Đang giao hàng', 'Đã hoàn thành', 'Hủy'],
      },
      timestamp: { type: Date, default: Date.now },
    }
  ],
  paymentMethod: {
    type: String,
    enum: ['COD', 'BankTransfer', 'Momo', 'ZaloPay'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['Chưa thanh toán', 'Đã thanh toán', 'Đã hoàn tiền'],
    default: 'Chưa thanh toán',
  },
  cancellationReason: { type: String, maxlength: 1000, default: null },
  promotionCode: { type: String, default: null },
  estimatedDeliveryDate: { type: Date, default: null },
  notes: { type: String, maxlength: 1000 },

  isCancelRequested: { type: Boolean, default: false },
  cancelRequestTime: { type: Date, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);