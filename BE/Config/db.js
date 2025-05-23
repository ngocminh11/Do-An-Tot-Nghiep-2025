const mongoose = require('mongoose');
const ResponseCode = require('../Constants/ResponseCode');  // Đảm bảo import constants
const ResponseMessage = require('../Constants/ResponseMessage');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Kiểm tra nếu kết nối thành công
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    // Thực hiện một truy vấn test đơn giản (ví dụ, kiểm tra thông tin cơ sở dữ liệu)
    const dbStatus = await mongoose.connection.db.admin().serverStatus();
    console.log('MongoDB Server Status:', dbStatus);

  } catch (error) {
    console.error(`❌ MongoDB connection failed: ${error.message}`);

    // Sử dụng mã lỗi và thông điệp từ constants
    const errorCode = ResponseCode.ERROR_INTERNAL_SERVER;  // Lỗi máy chủ
    const errorMessage = ResponseMessage.ERROR_INTERNAL_SERVER;

    // Dừng chương trình nếu kết nối thất bại
    process.exit(1); // Nếu không kết nối được, dừng chương trình
  }
};

module.exports = connectDB;

