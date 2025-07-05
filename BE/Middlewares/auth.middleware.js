const jwt = require('jsonwebtoken');
const Account = require('../Models/Accounts');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');
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
    const account = await Account.findById(payload.id).select('-passwordHash');
    if (!account)
      return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_INVALID_TOKEN);

    req.user = account;
    req.user.roleFromToken = payload.role;
    next();
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_FAILED);
  }
};

/* =============== ỦY QUYỀN THEO ROLE ================= */
/**
 * Trong route:  router.post('/xxx', authenticateUser, authorizeRoles('Quản Lý Chính', 'Quản Lý Kho'), ...)
 */
exports.authorizeRoles = (...allowed) => (req, res, next) => {
  try {
    if (!req.user) return sendError(res, 401, Messages.AUTH_FAILED);

    // Ưu tiên dùng role từ token (đã được verify)
    const userRole = req.user.roleFromToken || req.user.role;

    // Chuẩn hóa để so sánh
    const normalizedUserRole = (typeof userRole === 'string' ? userRole : '').trim().toLowerCase();
    
    
    // Flatten array nếu cần (xử lý trường hợp allowed là [[...]])
    const flattenedAllowed = Array.isArray(allowed) ? allowed.flat(Infinity) : allowed;
    
    const normalizedAllowed = (Array.isArray(flattenedAllowed) ? flattenedAllowed : [])
      .filter(r => {
        const isValid = r && typeof r === 'string';
        if (!isValid) {
        }
        return isValid;
      })
      .map(r => r.trim().toLowerCase());


    if (!normalizedAllowed.includes(normalizedUserRole))
      return sendError(res, 403, Messages.ERROR_FORBIDDEN);

    next();
  } catch (error) {
    console.error('[AUTHZ] Error in authorizeRoles:', error);
    console.error('[AUTHZ] Allowed:', allowed);
    console.error('[AUTHZ] User role:', req.user?.roleFromToken || req.user?.role);
    return sendError(res, 500, 'Lỗi xác thực quyền');
  }
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
  const token = req.headers.authorization?.split(' ')[1];
  if (!token)
    return sendError(res, 401, Messages.AUTH_NO_TOKEN);

  try {
    req.verifiedOTP = jwt.verify(token, process.env.JWT_OTP_SECRET);
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
