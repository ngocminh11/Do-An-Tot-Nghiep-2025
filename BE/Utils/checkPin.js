// utils/checkPin.js  (tạo mới)
const Account = require('../Models/Accounts');          // bảng đăng nhập
const mongoose = require('mongoose');

const PIN_ROLES = [
  'Quản Lý Kho',
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',
  'Quản Lý Chính'
];

/**
 * Kiểm tra PIN hợp lệ cho user hiện tại.
 * @param {Object} req  Express request (đã có req.user nhờ authenticateUser)
 * @throws  Error  Nếu role cần PIN nhưng không đúng/missing
 */
module.exports = async function checkPin(req) {
  /* ---- Roles KHÔNG yêu cầu PIN => bỏ qua ---- */
  if (!PIN_ROLES.includes(req.user.role)) return;

  /* ---- Lấy PIN người dùng vừa gửi ---- */
  const pinInput = req.body.pin;
  if (!pinInput) throw new Error('Thiếu mã PIN.');

  /* ---- Validate ObjectId ---- */
  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    throw new Error('ID tài khoản không hợp lệ.');
  }

  /* ---- Đọc pin mới nhất trong DB (tránh rely cache req.user) ---- */
  try {
    const fresh = await Account.findById(req.user._id).select('pin');
    if (!fresh) throw new Error('Tài khoản không tồn tại.');

    const isMatch = String(pinInput).trim() === String(fresh.pin).trim();
    if (!isMatch) {
      throw new Error('PIN không chính xác.');
    }
  } catch (error) {
    if (error.name === 'CastError') {
      throw new Error('ID tài khoản không hợp lệ.');
    }
    throw error;
  }
};
