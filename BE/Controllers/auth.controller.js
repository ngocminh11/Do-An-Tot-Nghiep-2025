// controllers/auth.controller.js
const User = require('../Models/Accounts');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const path = require('path');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');

// === CONFIG EMAIL TRANSPORT ===
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

// === GỬI OTP ===
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Phải cung cấp email.');
  }

  const otp = generateOTP();
  const payload = { email, otp };
  const otpToken = generateToken(payload, process.env.JWT_OTP_SECRET, '10m');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>OTP</title>
</head>
<body style="font-family: Arial, sans-serif; background: #f8f8f8; padding: 20px;">
  <div style="max-width: 600px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <div style="text-align: center;">
      <img src="cid:cocoo_logo" alt="COCOO Logo" style="max-width: 150px; margin-bottom: 20px;" />
      <h2 style="color: #333;">Xác Thực OTP</h2>
    </div>
    <p>Xin chào tài khoản: <strong>${email}</strong>,</p>
    <p>Cảm ơn bạn đã sử dụng dịch vụ của <strong>COCOOSHOP!</strong>.</p>
    <p><strong>Mã xác thực OTP của bạn là:</strong></p>
    <div style="text-align: center; font-size: 32px; font-weight: bold; color: #d97706; margin: 20px 0;">
      ${otp}
    </div>
    <p>Mã OTP có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
    <hr style="margin: 30px 0;" />
    <p style="font-size: 13px; color: #888; text-align: center;">
      Đây là email tự động. Vui lòng không trả lời email này.<br/>
      Thêm <strong>cocooshopvn@gmail.com</strong> vào danh bạ email của bạn để đảm bảo bạn luôn nhận được email từ chúng tôi.
    </p>
    <p style="font-size: 13px; color: #888; text-align: center; margin-top: 10px;">
      © 2025 COCOOSHOP - Reirimal Vietnam. All rights reserved.
    </p>
  </div>
</body>
</html>
`;


  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Mã xác thực OTP - COCOOSHOP',
      html: htmlContent,
      attachments: [{
        filename: 'logo.jpg',
        path: path.join(__dirname, '../Assets/cocoo-logo.jpg'), // ✅ điều chỉnh đúng đường dẫn logo
        cid: 'cocoo_logo'
      }]
    });

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

// === ĐĂNG NHẬP (STEP 1) ===
exports.loginStep1 = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Sai email hoặc mật khẩu.');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, 'Sai email hoặc mật khẩu.');

    const otp = generateOTP();
    const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Xác minh đăng nhập',
      text: `Mã OTP đăng nhập của bạn là: ${otp}`,
    });

    return sendSuccess(res, StatusCodes.SUCCESS_OK, { otpToken }, 'Đã gửi mã OTP xác minh đăng nhập.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// === ĐĂNG NHẬP (STEP 2) ===
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

  try {
    if (!isEmail(email)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Email không hợp lệ.');

    const user = await User.findOne({ email });
    if (!user) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy tài khoản với email này.');

    const otp = generateOTP();
    const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');

    await transporter.sendMail({
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu',
      text: `Mã OTP đặt lại mật khẩu của bạn là: ${otp}`,
    });
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

    user.passwordHash = await bcrypt.hash(newPassword, 10);
    await user.save();

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, 'Đặt lại mật khẩu thành công.');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// === REFRESH TOKEN ===
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
