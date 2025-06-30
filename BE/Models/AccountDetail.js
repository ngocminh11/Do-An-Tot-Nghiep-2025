const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ------------------- Validators chung ------------------- */
const stringValidator = {
  validator: v => /^[\p{L}0-9\s,.'-]+$/u.test(v),
  message:   props => `${props.path} chứa ký tự không hợp lệ.`
};
const wordCountValidator = (min, max) => ({
  validator(v) {
    const cnt = v.trim().split(/\s+/).length;
    return cnt >= min && cnt <= max;
  },
  message: props =>
    `${props.path} phải có từ ${min}‑${max} từ (hiện: ${props.value.trim().split(/\s+/).length})`
});
const phoneValidator = {
  validator: v => /^0\d{9,10}$/.test(v),
  message:   props => `${props.value} không phải số điện thoại hợp lệ.`
};

/* ------------------- AccountDetail schema ------------------- */
const userDetailSchema = new Schema(
  {
    /* Liên kết 1‑1 tới bảng Account */
    accountId: {
      type: Schema.Types.ObjectId,
      ref: 'Account',
      required: true,
      unique: true
    },

    /* Thông tin cá nhân */
    fullName: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100,
      validate: [stringValidator, wordCountValidator(2, 10)]
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
    phone: {
      type: String,
      required: true,
      validate: phoneValidator
    },

    /* Địa chỉ */
    address: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 300,
      validate: stringValidator
    },
    addresses: [
      {
        id:         { type: String, required: true },
        fullName:   { type: String, required: true },
        phoneNumber:{ type: String, required: true },
        city:       { type: String, required: true },
        district:   { type: String, required: true },
        ward:       { type: String, required: true },
        address:    { type: String, required: true },
        isDefault:  { type: Boolean, default: false }
      }
    ],

    /* Khách hàng – điểm thưởng & voucher */
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0
    },
    vouchers: [
      {
        promotionId: { type: Schema.Types.ObjectId, ref: 'Promotion' },
        isUsed:      { type: Boolean, default: false },
        redeemedAt:  Date
      }
    ],

    /* Liên kết đơn hàng */
    orderIds: [{ type: Schema.Types.ObjectId, ref: 'Order' }]
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserDetail', userDetailSchema);
