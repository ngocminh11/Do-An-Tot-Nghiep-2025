const mongoose = require('mongoose');
const ResponseCode = require('../Constants/ResponseCode');  // Đảm bảo import constants
const ResponseMessage = require('../Constants/ResponseMessage');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    const dbStatus = await mongoose.connection.db.admin().serverStatus();
    console.log('MongoDB Server Status:', dbStatus);

  } catch (error) {
    console.error(`MongoDB connection failed: ${error.message}`);

    const errorCode = ResponseCode.ERROR_INTERNAL_SERVER;  
    const errorMessage = ResponseMessage.ERROR_INTERNAL_SERVER;

  }
};

module.exports = connectDB;

