const jwt = require('jsonwebtoken');
const Account = require('../Models/Accounts');
const StatusCodes = require('../Constants/ResponseCode');
const Messages    = require('../Constants/ResponseMessage');
const { sendError } = require('../Utils/responseHelper');

/* ----------------- ROLES ------------------ */
const ROLE_ENUM = [
  'Khách Hàng',        // customer
  'Nhân Viên',         // staff
  'Quản Lý Kho',       // warehouseManager
  'Quản Lý Nhân Sự',   // HR manager
  'Quản Lý Đơn Hàng',  // order manager
  'Quản Lý Chính'      // general manager
];

/* =============== AUTHENTICATE ================= */
exports.authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token)
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_NO_TOKEN);

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    /*  ⚠️  payload (auth.controller)   { id, role }  */
    const account = await Account.findById(payload.id).select('-passwordHash');
    if (!account)
      return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_INVALID_TOKEN);

    req.user = account;               // gắn user vào request
    req.user.roleFromToken = payload.role; // tiện kiểm tra chéo
    next();
  } catch {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_FAILED);
  }
};

/* =============== ỦY QUYỀN THEO ROLE ================= */
/**
 * Trong route:  router.post('/xxx', authenticateUser, authorizeRoles('Quản Lý Chính', 'Quản Lý Kho'), ...)
 */
exports.authorizeRoles = (...allowed) => (req, res, next) => {
  if (!req.user)                                  // chưa login
    return sendError(res, 401, Messages.AUTH_FAILED);

  if (!allowed.includes(req.user.role))
    return sendError(res, 403, Messages.ERROR_FORBIDDEN);

  next();
};

/* Một helper khác: chỉ check nhóm role dùng PIN (nếu cần) */
const PIN_ROLES = [
  'Quản Lý Kho',
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',
  'Quản Lý Chính'
];
exports.authorizePinRoles = (req, res, next) =>
  exports.authorizeRoles(...PIN_ROLES)(req, res, next);

/* =============== VERIFY OTP TOKEN =============== */
exports.verifyOTPToken = (req, res, next) => {
  const { otpToken } = req.body;
  if (!otpToken)
    return sendError(res, 401, Messages.AUTH_NO_TOKEN);

  try {
    req.verifiedOTP = jwt.verify(otpToken, process.env.JWT_OTP_SECRET);
    next();
  } catch {
    return sendError(res, 401, Messages.INVALID_OR_EXPIRED_OTP);
  }
};

/* =============== VERIFY REFRESH TOKEN =============== */
exports.verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return sendError(res, 401, 'Thiếu refresh token');

  try {
    req.refreshPayload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    next();
  } catch {
    return sendError(res, 401, 'Refresh token hết hạn hoặc không hợp lệ.');
  }
};
