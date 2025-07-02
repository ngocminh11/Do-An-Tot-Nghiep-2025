const mongoose = require('mongoose');
const { Schema } = mongoose;
const bcrypt = require('bcryptjs');

/* ------------------ Email validator ------------------ */
const emailValidator = {
  validator: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  message: props => `${props.value} không phải email hợp lệ.`
};

/* ------------------ Hằng số role --------------------- */
const ROLE_ENUM = [
  'Khách Hàng',         // customer
  'Nhân Viên',          // staff
  'Quản Lý Kho',        // warehouseManager
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',    // hrManager
  'Quản Lý Chính'       // generalManager
];

const PIN_ROLES = [
  'Quản Lý Kho',
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',
  'Quản Lý Chính'
];
const PIN_REGEX = /^\d{6}$/; // đúng 6 chữ số

/* ------------------ Schema --------------------------- */
const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: emailValidator
    },
    emailVerified: { type: Boolean, default: false },

    passwordHash: {
      type: String,
      required: true,
      minlength: 60 // bcrypt hash length
    },

    /* 🔐 PIN 6‑số – chỉ cho 3 role đặc biệt */
    pin: {
      type: String,
      minlength: 6,
      maxlength: 60, // bcrypt hash length
      default: null,
      select: false // never return PIN in queries
    },

    role: {
      type: String,
      enum: ROLE_ENUM,
      default: 'Khách Hàng',
      required: true
    },
    accountStatus: {
      type: String,
      enum: ['Hoạt động', 'Dừng hoạt động', 'Đã bị khóa'],
      default: 'Hoạt động'
    },

    registrationIP: String,
    userAgent: String,
    refreshToken: String
  },
  { timestamps: true }
);

/* ------------------ Ràng buộc PIN theo role ------------------ */
userSchema.pre('validate', function (next) {
  const needPin = PIN_ROLES.includes(this.role);
  const hasPin = typeof this.pin === 'string' && this.pin.length > 0;

  if (needPin && !hasPin)        // role cần nhưng chưa có
    this.invalidate('pin', 'Vai trò này phải thiết lập PIN 6 số.');
  if (needPin && hasPin && !PIN_REGEX.test(this.pin)) // sai định dạng
    this.invalidate('pin', 'PIN phải gồm đúng 6 chữ số.');
  if (!needPin && hasPin)        // role không được phép có PIN
    this.invalidate('pin', 'Chỉ các vai trò quản lý mới được thiết lập PIN.');

  next();
});

// Hash PIN before save if modified
userSchema.pre('save', async function (next) {
  if (this.isModified('pin') && this.pin && /^\d{6}$/.test(this.pin)) {
    this.pin = await bcrypt.hash(this.pin, 10);
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
