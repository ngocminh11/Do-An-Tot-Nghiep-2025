const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../../Models/Users'); // đường dẫn tới model thực tế

// 🔧 Thay bằng URI của bạn
const MONGO_URI = 'mongodb+srv://ngocminh110804:ozmZ65hdg913RRl2@products.r6u0wfk.mongodb.net/?retryWrites=true&w=majority&appName=Products';

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Kết nối MongoDB thành công');

    const filePath = path.join(__dirname, 'users.seed.json');
    const users = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    await User.deleteMany(); // Xóa toàn bộ user cũ nếu cần
    await User.insertMany(users);

    console.log('Đã seed user thành công');
    process.exit();
  } catch (err) {
    console.error('Lỗi khi seed user:', err);
    process.exit(1);
  }
}

seedUsers();
