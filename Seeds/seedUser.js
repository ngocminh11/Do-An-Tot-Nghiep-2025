// seed/seedUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../Models/User');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/doan_mypham', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const seedUser = async () => {
  // Tạo mật khẩu đã mã hóa cho admin và user
  const hashedPasswordAdmin = await bcrypt.hash('admin123', 10);
  const hashedPasswordUser = await bcrypt.hash('user123', 10);

  // Tạo dữ liệu người dùng Admin
  const adminUser = new User({
    username: 'admin',
    email: 'admin@example.com',
    password: hashedPasswordAdmin,
  });

  // Tạo dữ liệu người dùng thường
  const regularUser = new User({
    username: 'user',
    email: 'user@example.com',
    password: hashedPasswordUser,
  });

  // Lưu người dùng vào cơ sở dữ liệu
  try {
    await adminUser.save();
    await regularUser.save();

    console.log('Dữ liệu người dùng đã được thêm vào!');
  } catch (err) {
    console.error('Lỗi khi thêm dữ liệu người dùng:', err);
  }

  mongoose.disconnect();  // Ngắt kết nối sau khi thêm dữ liệu
};

seedUser();
