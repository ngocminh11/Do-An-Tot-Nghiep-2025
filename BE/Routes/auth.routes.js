const express = require('express');
const router = express.Router();
const authController = require('../Controllers/auth.controller');
const {
  verifyOTPToken
} = require('../Middlewares/auth.middleware');

// === GỬI & XÁC MINH OTP ===
router.post('/send-otp', authController.sendOTP);             // Gửi OTP tới email
router.post('/verify-otp', authController.verifyOTP);         // Xác minh OTP để dùng cho đăng ký hoặc reset

// === ĐĂNG KÝ & ĐẶT LẠI MẬT KHẨU ===
router.post('/register', verifyOTPToken, authController.register);            // Đăng ký tài khoản sau khi OTP verified
router.post('/forgot-password', authController.forgotPassword);              // Gửi OTP reset mật khẩu
router.post('/reset-password', verifyOTPToken, authController.resetPassword); // Đặt lại mật khẩu sau OTP

// === ĐĂNG NHẬP 2 BƯỚC ===
router.post('/login', authController.loginStep1);               // Bước 1: kiểm tra email + password, gửi OTP
router.post('/login-verify', authController.loginStep2);        // Bước 2: xác minh OTP => nhận access + refresh token

// === LÀM MỚI ACCESS TOKEN ===
router.post('/refresh-token', authController.refreshToken);     // Dùng refresh token để lấy access token mới

module.exports = router;
