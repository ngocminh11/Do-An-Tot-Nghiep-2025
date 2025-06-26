// models/Orders.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  idOrder: {
    type: String,
    unique: true,
    default: function () {
      // Tạo ID tự động với format: ORD + timestamp + random number
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      return `ORD${timestamp}${random}`;
    }
  },
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

  // Thông tin giao hàng (shipper/hãng vận chuyển)
  shippingInfo: {
    carrier: { type: String, default: null }, // Tên hãng vận chuyển (GHN, Viettel Post...)
    shipperName: { type: String, default: null }, // Tên người giao hàng (nếu có)
    shipperPhone: { type: String, default: null },
    trackingNumber: { type: String, default: null }, // Mã vận đơn
    extra: { type: String, default: null } // Thông tin bổ sung nếu cần
  },

  isCancelRequested: { type: Boolean, default: false },
  cancelRequestTime: { type: Date, default: null },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);