require('dotenv').config();  // Dòng này phải nằm trên cùng

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./Routes/product.routes');
const logToCSV = require('./Utils/logger');

const app = express();
const PORT = process.env.PORT;

app.use(cors()); 

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

app.use('/admin/products', productRoutes);

app.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
});