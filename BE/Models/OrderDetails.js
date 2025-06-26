// models/OrderDetail.js
const mongoose = require('mongoose');

const logOrder = new mongoose.Schema(
  {
    type   : { type: String, enum: ['create', 'status-change', 'cancel'], required: true },
    message: { type: String, required: true },
    actor  : { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role   : { type: String, enum: ['user', 'admin'], required: true },
    at     : { type: Date, default: Date.now }
  },
  { _id: false }
);

const addressSnapshot = new mongoose.Schema(
  {
    fullName  : String,
    phone     : String,
    line1     : String,
    line2     : String,
    ward      : String,
    district  : String,
    province  : String,
    postalCode: String,
    country   : String
  },
  { _id: false }
);

const shippingInfoSchema = new mongoose.Schema(
  {
    carrier       : String,
    shipperName   : String,
    shipperPhone  : String,
    trackingNumber: String,
    estimatedDate : Date,
    extra         : String
  },
  { _id: false }
);

const orderDetailSchema = new mongoose.Schema(
  {
    order            : { type: mongoose.Schema.Types.ObjectId, ref: 'Order', unique: true, required: true },
    shippingAddress  : addressSnapshot,          // snapshot lúc tạo đơn
    shippingInfo     : shippingInfoSchema,       // sẽ ghi khi bắt đầu giao
    cancellationReason: { type: String, maxlength: 1_000 },
    logs             : [logOrder]
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('OrderDetail', orderDetailSchema);
