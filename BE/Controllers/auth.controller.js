// controllers/auth.controller.js – FULL VERSION (Account + AccountDetail)
// =============================================================================
const mongoose   = require('mongoose');
const bcrypt     = require('bcryptjs');
const jwt        = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const Account       = require('../Models/Accounts');        // bảng đăng nhập
const AccountDetail = require('../Models/AccountDetail');  // bảng hồ sơ 1‑1

const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const { generateOtpEmailHtml, logoPath } = require('../Utils/emailTemplates');

require('dotenv').config();

/* ---------------------------- CẤU HÌNH GMAIL ------------------------------ */
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});

/* ---------------------------- CONSTANTS & MAPS --------------------------- */
const otpRateLimitMap = new Map(); // email => {count, firstAttemptTime}
const loginAttempts   = new Map(); // email => {count, lockUntil}

/* ---------------------------- ENUM & ROLE -------------------------------- */
const PIN_ROLES = ['Quản Lý Kho', 'Quản Lý Nhân Sự', 'Quản Lý Chính'];
const STATUS_OK = ['Hoạt động', 'Dừng hoạt động', 'Đã bị khóa'];

/* ---------------------------- HELPERS ------------------------------------ */
const generateOTP   = () => Math.floor(100000 + Math.random() * 900000).toString();
const generateToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, { expiresIn });
const isEmail       = v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isHashed      = h => h?.startsWith('$2a$') || h?.startsWith('$2b$') || h?.startsWith('$2y$');

const sendOtpEmail = async (email, otp, subject = 'Mã xác thực OTP - COCOOSHOP', title = 'Xác Thực OTP', note) => {
  const html = generateOtpEmailHtml(
    email,
    otp,
    title,
    note || 'Mã OTP có hiệu lực trong vòng <strong>10 phút</strong>. Vui lòng không chia sẻ mã này với bất kỳ ai.'
  );
  return transporter.sendMail({
    from: process.env.EMAIL_USERNAME,
    to:   email,
    subject,
    html,
    attachments: [{ filename: 'logo.jpg', path: logoPath, cid: 'cocoo_logo' }]
  });
};

/* ============================================================================
   1. SEND OTP (đăng ký / xác minh email)
============================================================================ */
exports.sendOTP = async (req, res) => {
  const { email } = req.body;
  if (!email || !isEmail(email))
    return sendError(res, 400, 'Email không hợp lệ.');

  // Rate‑limit: 3 lần / phút / email
  const now  = Date.now();
  const win  = 60 * 1000;
  const max  = 3;
  const data = otpRateLimitMap.get(email);

  if (data && now - data.firstAttemptTime < win) {
    if (data.count >= max)
      return sendError(res, 429, 'Quá nhiều yêu cầu OTP. Thử lại sau 1 phút.');
    data.count += 1;
  } else {
    otpRateLimitMap.set(email, { count: 1, firstAttemptTime: now });
  }

  const otp      = generateOTP();
  const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');

  try {
    await sendOtpEmail(email, otp);
    return sendSuccess(res, 200, { otpToken }, 'OTP đã được gửi tới email.');
  } catch (e) {
    return sendError(res, 500, 'Không thể gửi OTP.');
  }
};

/* ============================================================================
   2. VERIFY OTP (trả verifiedToken)
============================================================================ */
exports.verifyOTP = async (req, res) => {
  const { otpToken, otp } = req.body;
  if (!otpToken || !otp) return sendError(res, 400, 'Thiếu OTP hoặc token.');
  if (!/^\d{6}$/.test(otp)) return sendError(res, 400, 'OTP phải gồm 6 chữ số.');

  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_OTP_SECRET);
    if (decoded.otp !== otp) return sendError(res, 401, 'OTP không chính xác.');

    const verifiedToken = generateToken({ email: decoded.email }, process.env.JWT_OTP_SECRET, '15m');
    return sendSuccess(res, 200, { otpToken: verifiedToken }, 'Xác thực OTP thành công.');
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'OTP đã hết hạn.' : 'Token OTP không hợp lệ.';
    return sendError(res, 401, msg);
  }
};

/* ============================================================================
   3. REGISTER (customer – không PIN)
============================================================================ */
exports.register = async (req, res) => {
  const { fullName, email, password, phone, skinType, address, gender } = req.body;
  const { email: verifiedEmail } = req.verifiedOTP || {};
  if (email !== verifiedEmail) return sendError(res, 401, 'Email chưa được xác minh.');

  try {
    if (await Account.exists({ email }))
      return sendError(res, 409, 'Email đã tồn tại.');

    const passwordHash = await bcrypt.hash(password, 10);

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [acc] = await Account.create([{
        email,
        passwordHash,
        role: 'Khách Hàng',
        accountStatus: 'Hoạt động',
        emailVerified: true,
        pin: null
      }], { session });

      await AccountDetail.create([{
        accountId: acc._id,
        fullName,
        gender,
        skinType,
        phone,
        address
      }], { session });

      await session.commitTransaction();
      session.endSession();

      const accessToken  = generateToken({ id: acc._id }, process.env.JWT_SECRET,          '15m');
      const refreshToken = generateToken({ id: acc._id }, process.env.JWT_REFRESH_SECRET, '7d');
      acc.refreshToken = refreshToken;
      await acc.save();

      return sendSuccess(res, 201, {
        user: { _id: acc._id, fullName, email, phone, role: acc.role },
        accessToken,
        refreshToken
      }, 'Đăng ký thành công.');
    } catch (e) {
      await session.abortTransaction();
      session.endSession();
      throw e;
    }
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

/* ============================================================================
   4. LOGIN STEP 1  (kiểm mật khẩu, gửi OTP)
============================================================================ */
exports.loginStep1 = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return sendError(res, 400, 'Thiếu email hoặc mật khẩu.');

  const attempt = loginAttempts.get(email);
  const now     = Date.now();
  if (attempt && attempt.lockUntil > now) {
    const wait = Math.ceil((attempt.lockUntil - now) / 1000);
    return sendError(res, 429, `Tài khoản tạm khóa ${wait}s.`, { failedAttempts: attempt.count });
  }

  try {
    const acc = await Account.findOne({ email });
    if (!acc) return failLogin(email);

    if (!isHashed(acc.passwordHash)) {
      acc.passwordHash = await bcrypt.hash(acc.passwordHash, 10);
      await acc.save();
    }

    const match = await bcrypt.compare(password, acc.passwordHash);
    if (!match) return failLogin(email);

    // Reset đếm sai
    loginAttempts.delete(email);

    const otp      = generateOTP();
    const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');
    await sendOtpEmail(email, otp, 'Xác minh đăng nhập - COCOOSHOP',
      'Mã OTP đăng nhập của bạn có hiệu lực trong vòng <strong>10 phút</strong>.');

    return sendSuccess(res, 200, { otpToken }, 'Đã gửi OTP xác minh.');
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

/* helper cho login */
function failLogin(email) {
  const countObj = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  const cnt = countObj.count + 1;
  if (cnt >= 3) {
    loginAttempts.set(email, { count: cnt, lockUntil: Date.now() + 60_000 });
  } else {
    loginAttempts.set(email, { count: cnt, lockUntil: 0 });
  }
  return sendError(global.res, 401, 'Sai email hoặc mật khẩu.', { failedAttempts: cnt }); // global.res sẽ được gán ở call site
}

/* ============================================================================
   5. LOGIN STEP 2 (xác OTP, cấp token)
============================================================================ */
exports.loginStep2 = async (req, res) => {
  const { otpToken, otp } = req.body;
  if (!otpToken || !otp) return sendError(res, 400, 'Thiếu OTP hoặc token.');

  try {
    const decoded = jwt.verify(otpToken, process.env.JWT_OTP_SECRET);
    if (decoded.otp !== otp) return sendError(res, 401, 'OTP không chính xác.');

    const acc = await Account.findOne({ email: decoded.email }).select('-passwordHash -refreshToken');
    if (!acc) return sendError(res, 404, 'Không tìm thấy tài khoản.');
    if (acc.accountStatus === 'Đã bị khóa')
      return sendError(res, 403, 'Tài khoản đã bị khóa.');

    const accessToken  = generateToken({ id: acc._id }, process.env.JWT_SECRET,          '1h');
    const refreshToken = generateToken({ id: acc._id }, process.env.JWT_REFRESH_SECRET, '7d');
    await Account.findByIdAndUpdate(acc._id, { refreshToken });

    return sendSuccess(res, 200, {
      user: acc,
      accessToken,
      refreshToken
    }, 'Đăng nhập thành công.');
  } catch (err) {
    return sendError(res, 401, 'OTP không hợp lệ hoặc đã hết hạn.');
  }
};

/* ============================================================================
   6. FORGOT PASSWORD (send OTP)
============================================================================ */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email || !isEmail(email)) return sendError(res, 400, 'Email không hợp lệ.');
  const acc = await Account.findOne({ email });
  if (!acc) return sendError(res, 404, 'Không tìm thấy tài khoản.');

  const otp      = generateOTP();
  const otpToken = generateToken({ email, otp }, process.env.JWT_OTP_SECRET, '10m');
  await sendOtpEmail(email, otp, 'Mã OTP đặt lại mật khẩu - COCOOSHOP',
    'Mã OTP đặt lại mật khẩu của bạn có hiệu lực trong vòng <strong>10 phút</strong>.');
  return sendSuccess(res, 200, { otpToken }, 'Đã gửi OTP đặt lại mật khẩu.');
};

/* ============================================================================
   7. RESET PASSWORD (đã verify OTP)                                          
============================================================================ */
exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body;
  const { email } = req.verifiedOTP || {};
  if (!email) return sendError(res, 401, 'Chưa xác minh email.');
  const acc = await Account.findOne({ email });
  if (!acc) return sendError(res, 404, 'Tài khoản không tồn tại.');

  acc.passwordHash = await bcrypt.hash(newPassword, 10);
  await acc.save();
  return sendSuccess(res, 200, null, 'Đặt lại mật khẩu thành công.');
};

/* ============================================================================
   8. REFRESH TOKEN                                                          
============================================================================ */
exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 400, 'Thiếu refresh token.');

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const acc = await Account.findById(decoded.id);
    if (!acc || acc.refreshToken !== refreshToken)
      return sendError(res, 401, 'Refresh token không hợp lệ.');

    const newAccess = generateToken({ id: acc._id }, process.env.JWT_SECRET, '15m');
    return sendSuccess(res, 200, { accessToken: newAccess }, 'Làm mới token thành công.');
  } catch {
    return sendError(res, 401, 'Refresh token hết hạn hoặc không hợp lệ.');
  }
};

// ============================================================================
// helper cập nhật số lần đăng nhập sai (TypeScript warning fix)              
// ============================================================================
function updateLoginAttempts(email) {
  const cur = loginAttempts.get(email) || { count: 0, lockUntil: 0 };
  cur.count += 1;
  if (cur.count >= 3) cur.lockUntil = Date.now() + 60_000; // khóa 1p
  loginAttempts.set(email, cur);
  return cur.count;
}
