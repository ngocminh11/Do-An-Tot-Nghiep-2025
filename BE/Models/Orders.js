// models/Order.js
const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    product      : { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName  : { type: String, required: true },
    unit         : { type: String, required: true },
    currency     : { type: String, default: 'VND' },
    quantity     : { type: Number, required: true, min: 1 },
    price        : { type: Number, required: true, min: 0 },
    discount     : { type: Number, default: 0 }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    /** ID hiển thị cho người dùng – auto theo format ORD + time + rand */
    idOrder: {
      type   : String,
      unique : true,
      default() {
        const ts  = Date.now().toString().slice(-8);
        const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `ORD${ts}${rnd}`;
      }
    },

    /** Chủ sở hữu đơn */
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    /** Danh sách item snapshot (không phụ thuộc thay đổi giá sau này) */
    items: { type: [orderItemSchema], required: true },

    /** Tổng tiền sau chiết khấu từng dòng */
    totalAmount: { type: Number, required: true, min: 0 },

    /** Workflow */
    status: {
      type   : String,
      enum   : ['Chờ xác nhận', 'Xác nhận', 'Đang giao hàng', 'Đã hoàn thành', 'Hủy'],
      default: 'Chờ xác nhận'
    },
    statusHistory: [
      {
        status   : {
          type : String,
          enum : ['Chờ xác nhận', 'Xác nhận', 'Đang giao hàng', 'Đã hoàn thành', 'Hủy']
        },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    /** Thanh toán */
    paymentMethod: {
      type   : String,
      enum   : ['COD', 'BankTransfer', 'Momo', 'ZaloPay'],
      default: 'COD'
    },
    paymentStatus: {
      type   : String,
      enum   : ['Chưa thanh toán', 'Đã thanh toán', 'Đã hoàn tiền', 'Chưa hoàn tiền'],
      default: 'Chưa thanh toán'
    },

    /** Mã KM / ghi chú … */
    promotionCode        : { type: String },
    notes                : { type: String, maxlength: 1_000 },

    /** Flag/yêu cầu huỷ của user */
    isCancelRequested    : { type: Boolean, default: false },
    cancelRequestTime    : { type: Date }
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model('Order', orderSchema);
