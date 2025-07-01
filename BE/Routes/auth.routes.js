// routes/auth.js
// ===========================================================================
//  AUTH ROUTES – Đăng ký, OTP, Đăng nhập 2 bước, Đặt lại mật khẩu, Refresh
// ===========================================================================

const express = require('express');
const router  = express.Router();
const authCtrl = require('../Controllers/auth.controller');
const { verifyOTPToken, verifyRefreshToken } = require('../Middlewares/auth.middleware');

/* ===========================================================================
 * 1. GỬI & XÁC MINH OTP – dùng cho cả Đăng ký và Quên mật khẩu
 * =========================================================================== */

// Gửi OTP đến email (cho đăng ký hoặc reset mật khẩu)
router.post('/send-otp', authCtrl.sendOTP);

// Xác minh OTP – nếu đúng sẽ trả về `otpToken` tạm thời
router.post('/verify-otp', authCtrl.verifyOTP);

/* ===========================================================================
 * 2. ĐĂNG KÝ & RESET PASSWORD – yêu cầu đã xác minh OTP
 * =========================================================================== */

// Đăng ký tài khoản mới sau khi đã xác minh OTP
router.post('/register', verifyOTPToken, authCtrl.register);

// Quên mật khẩu – gửi OTP về email
router.post('/forgot-password', authCtrl.forgotPassword);

// Đặt lại mật khẩu mới (sau khi xác minh OTP)
router.post('/reset-password', verifyOTPToken, authCtrl.resetPassword);

/* ===========================================================================
 * 3. ĐĂNG NHẬP 2 BƯỚC – bảo mật nâng cao
 * =========================================================================== */

// Bước 1: kiểm tra email & mật khẩu => nếu đúng sẽ gửi OTP về email
router.post('/login', authCtrl.loginStep1);

// Bước 2: xác minh OTP → trả về access token + refresh token
router.post('/login-verify', authCtrl.loginStep2);

/* ===========================================================================
 * 4. LÀM MỚI ACCESS TOKEN
 * =========================================================================== */

// Dùng refresh token hợp lệ để lấy access token mới (không cần OTP)
router.post('/refresh-token', verifyRefreshToken, authCtrl.refreshToken);

module.exports = router;
