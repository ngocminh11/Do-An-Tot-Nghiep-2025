// utils/checkPin.js  (tạo mới)
const Account = require('../Models/Accounts');          // bảng đăng nhập

const PIN_ROLES = [
  'Quản Lý Kho',
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',
  'Quản Lý Chính'
];

/**
 * Kiểm tra PIN hợp lệ cho user hiện tại.
 * @param {Object} req  Express request (đã có req.user nhờ authenticateUser)
 * @throws  Error  Nếu role cần PIN nhưng không đúng/missing
 */
module.exports = async function checkPin(req) {
  /* ---- Roles KHÔNG yêu cầu PIN => bỏ qua ---- */
  if (!PIN_ROLES.includes(req.user.role)) return;

  /* ---- Lấy PIN người dùng vừa gửi ---- */
  const pinInput = req.body.pin || req.headers['x-pin'];
  if (!pinInput) throw new Error('Thiếu mã PIN.');

  /* ---- Đọc pin mới nhất trong DB (tránh rely cache req.user) ---- */
  const fresh = await Account.findById(req.user._id).select('pin');
  if (!fresh) throw new Error('Tài khoản không tồn tại.');

  if (pinInput !== fresh.pin)
    throw new Error('PIN không chính xác.');
};
