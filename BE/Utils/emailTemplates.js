// Utils/emailTemplates.js

const path = require('path');

function generateOtpEmailHtml(email, otp) {
  return `
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
}

const logoPath = path.join(__dirname, '../Assets/cocoo-logo.jpg');

module.exports = {
  generateOtpEmailHtml,
  logoPath,
};
