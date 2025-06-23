const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  shippingInfo: {
    recipientName: { type: String, required: true },
    phone: { type: String, required: true, match: /^0\d{9}$/ },
    address: { type: String, required: true, minlength: 10, maxlength: 300 },
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending',
  },
  statusHistory: [{
    status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] },
    timestamp: { type: Date, default: Date.now }
  }],
  paymentMethod: {
    type: String,
    enum: ['COD', 'BankTransfer', 'Momo', 'ZaloPay'],
    default: 'COD',
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid',
  },
  promotionCode: {
    type: String,
    default: null,
  },
  notes: {
    type: String,
    maxlength: 1000,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Order', orderSchema);