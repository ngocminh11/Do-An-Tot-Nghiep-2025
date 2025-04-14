// seed/seedUserDetail.js
const mongoose = require('mongoose');
const User = require('../Models/User');
const UserDetail = require('../Models/UserDetail');

// Kết nối MongoDB
mongoose.connect('mongodb://localhost:27017/doan_mypham', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const seedUserDetail = async () => {
  // Lấy ID người dùng từ bảng SYS_USER
  const adminUser = await User.findOne({ username: 'admin' });
  const regularUser = await User.findOne({ username: 'user' });

  if (!adminUser || !regularUser) {
    console.error('Không tìm thấy người dùng');
    return;
  }

  // Dữ liệu người dùng Admin - SYS_USER_DETAIL
  const adminUserDetail = new UserDetail({
    user_id: adminUser._id,
    fullname: 'Admin User',
    role_id: 1,  // Admin có role_id = 1
    phone: '0123456789',
    status: 'Active',
    birth_date: new Date('1990-01-01'),
    personal_image: 'data:image/png;base64,...',  // Thêm base64 của ảnh
  });

  // Dữ liệu người dùng thường - SYS_USER_DETAIL
  const regularUserDetail = new UserDetail({
    user_id: regularUser._id,
    fullname: 'Regular User',
    role_id: 2,  // User có role_id = 2
    phone: '0987654321',
    status: 'Active',
    birth_date: new Date('1995-05-15'),
    personal_image: 'data:image/png;base64,...',  // Thêm base64 của ảnh
  });

  // Lưu dữ liệu vào cơ sở dữ liệu
  try {
    await adminUserDetail.save();
    await regularUserDetail.save();

    console.log('Dữ liệu chi tiết người dùng đã được thêm vào!');
  } catch (err) {
    console.error('Lỗi khi thêm dữ liệu chi tiết người dùng:', err);
  }

  mongoose.disconnect();  // Ngắt kết nối sau khi thêm dữ liệu
};

seedUserDetail();
