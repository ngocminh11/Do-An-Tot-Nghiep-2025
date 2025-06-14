const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  idOrder: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  idUser: {
    type: String,
    required: true,
    trim: true,
    ref: 'User'
  },
  items: [{
    idProduct: {
      type: String,
      required: true,
      trim: true,
      ref: 'Product'
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'BankTransfer', 'Momo', 'ZaloPay'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'refunded'],
    default: 'unpaid'
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
