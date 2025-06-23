const jwt = require('jsonwebtoken');
const User = require('../Models/Accounts');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');
const { sendError } = require('../Utils/responseHelper');

// Middleware xác thực access token
exports.authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_NO_TOKEN);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-passwordHash');
    if (!user) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_INVALID_TOKEN);

    req.user = user;
    next();
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_FAILED);
  }
};

// Middleware phân quyền admin
exports.authorizeAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return sendError(res, StatusCodes.ERROR_FORBIDDEN, Messages.ERROR_FORBIDDEN);
  }
  next();
};

// Middleware xác thực OTP token (cho email hoặc số điện thoại)
exports.verifyOTPToken = (req, res, next) => {
  const { otpToken } = req.body;
  if (!otpToken) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.AUTH_NO_TOKEN);

  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_OTP_SECRET);
    req.verifiedOTP = decoded; // email hoặc phone đã được xác thực
    next();
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, Messages.INVALID_OR_EXPIRED_OTP);
  }
};

// Middleware xác thực refresh token
exports.verifyRefreshToken = (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Thiếu refresh token');

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    req.refreshPayload = decoded;
    next();
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Refresh token không hợp lệ hoặc đã hết hạn.');
  }
};
