// controllers/auth.controller.js
const User = require('../Models/Accounts');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const { generateOtpEmailHtml, logoPath } = require('../Utils/emailTemplates');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// === HELPERS ===
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const generateToken = (payload, secret, expiresIn) =>
  jwt.sign(payload, secret, { expiresIn });

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// Hàm kiểm tra mật khẩu đã hash bcrypt chưa
const isHashed = (passwordHash) => {
  if (!passwordHash) return false;
  return passwordHash.startsWith('$2a$') || passwordHash.startsWith('$2b$') || passwordHash.startsWith('$2y$');
};

// === GỬI OTP CHUNG ===
async function sendOtpEmail(email, otp, subject = 'Mã xác thực OTP - COCOOSHOP', title = 'Xác Thực OTP', note) {
  const htmlContent = generateOtpEmailHtml(email, otp, title, note || 'Mã OTP có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.');

  return transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to: email,
    subject,
    html: htmlContent,
    attachments: [{
      filename: 'logo.jpg',
      path: logoPath,
      cid: 'cocoo_logo',
    }],
  });
}

// === API SEND OTP ĐĂNG KÝ / XÁC THỰC EMAIL ===
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Phải cung cấp email.');
  if (!isEmail(email)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Email không hợp lệ.');

  const otp = generateOTP();
  const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');

  try {
    await sendOtpEmail(email, otp, 'Mã xác thực OTP - COCOOSHOP', 'Xác Thực OTP');
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { otpToken }, 'OTP đã được gửi qua email.');
  } catch (error) {
    console.error('Lỗi khi gửi OTP:', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Không thể gửi OTP. Vui lòng thử lại.');
  }
};

// === XÁC MINH OTP ===
exports.verifyOTP = async (req, res) => {
  const { otpToken, otp } = req.body;
  if (!otpToken || !otp) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Thiếu mã OTP hoặc token.');

  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_OTP_SECRET);
    if (decoded.otp !== otp) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Mã OTP không chính xác.');

    const verifiedToken = generateToken({ email: decoded.email }, process.env.JWT_OTP_SECRET, '15m');
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { otpToken: verifiedToken }, 'OTP xác thực thành công.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'OTP không hợp lệ hoặc đã hết hạn.');
  }
};

// === ĐĂNG KÝ ===
exports.register = async (req, res) => {
  const { fullName, email, password, phone, skinType, address, gender } = req.body;
  const { email: verifiedEmail } = req.verifiedOTP || {};

  if (email !== verifiedEmail) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Email chưa được xác minh.');
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return sendError(res, StatusCodes.ERROR_CONFLICT, 'Email đã tồn tại.');

    // Luôn hash mật khẩu mới
    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      phone,
      gender,
      skinType,
      address,
      passwordHash,
      role: 'customer',
      emailVerified: true,
    });

    await newUser.save();

    const accessToken = generateToken({ id: newUser._id }, process.env.JWT_SECRET, '15m');
    const refreshToken = generateToken({ id: newUser._id }, process.env.JWT_REFRESH_SECRET, '7d');

    newUser.refreshToken = refreshToken;
    await newUser.save();

    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, {
      user: {
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
      },
      accessToken,
      refreshToken,
    }, 'Đăng ký thành công.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// === ĐĂNG NHẬP (STEP 1) - GỬI OTP XÁC MINH ===
exports.loginStep1 = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Thiếu email hoặc mật khẩu.');

  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Sai email hoặc mật khẩu.');

    const pwdHash = user.passwordHash || '';

    // Nếu mật khẩu chưa hash, tự động hash lại và lưu DB
    if (!isHashed(pwdHash)) {
      const newHash = await bcrypt.hash(pwdHash, 10);
      user.passwordHash = newHash;
      await user.save();
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Sai email hoặc mật khẩu.');

    const otp = generateOTP();
    const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');

    await sendOtpEmail(email, otp, 'Xác minh đăng nhập - COCOOSHOP', 'Mã OTP đăng nhập của bạn có hiệu lực trong vòng <strong>10 phút</strong>.');

    return sendSuccess(res, StatusCodes.SUCCESS_OK, { otpToken }, 'Đã gửi mã OTP xác minh đăng nhập.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// === ĐĂNG NHẬP (STEP 2) - XÁC NHẬN OTP ===
exports.loginStep2 = async (req, res) => {
  const { otpToken, otp } = req.body;
  if (!otpToken || !otp) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Thiếu OTP hoặc token.');
  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_OTP_SECRET);
    if (decoded.otp !== otp) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'OTP không hợp lệ.');

    const user = await User.findOne({ email: decoded.email });
    if (!user) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy tài khoản.');

    const accessToken = generateToken({ id: user._id }, process.env.JWT_SECRET, '15m');
    const refreshToken = generateToken({ id: user._id }, process.env.JWT_REFRESH_SECRET, '7d');

    user.refreshToken = refreshToken;
    await user.save();

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
      accessToken,
      refreshToken,
    }, 'Đăng nhập thành công.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'OTP không hợp lệ hoặc đã hết hạn.');
  }
};

// === GỬI OTP ĐẶT LẠI MẬT KHẨU ===
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Cần cung cấp email.');
  if (!isEmail(email)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Email không hợp lệ.');

  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy tài khoản với email này.');

    const otp = generateOTP();
    const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');

    await sendOtpEmail(email, otp, 'Mã OTP đặt lại mật khẩu - COCOOSHOP', 'Mã OTP đặt lại mật khẩu của bạn có hiệu lực trong vòng <strong>10 phút</strong>.');

    return sendSuccess(res, StatusCodes.SUCCESS_OK, { otpToken }, 'Đã gửi OTP đặt lại mật khẩu qua email.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// === ĐẶT LẠI MẬT KHẨU ===
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { email } = req.verifiedOTP || {};

  if (!email) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Chưa xác minh email.');

  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Tài khoản không tồn tại.');

    // Luôn hash mật khẩu mới khi reset
    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, 'Đặt lại mật khẩu thành công.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// === LÀM MỚI ACCESS TOKEN (REFRESH TOKEN) ===
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Thiếu refresh token.');

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== refreshToken) {
      return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Refresh token không hợp lệ.');
    }

    const newAccessToken = generateToken({ id: user._id }, process.env.JWT_SECRET, '15m');
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { accessToken: newAccessToken }, 'Làm mới token thành công.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Refresh token hết hạn hoặc không hợp lệ.');
  }
};
