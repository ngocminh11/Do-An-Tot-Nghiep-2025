require('dotenv').config();  // Dòng này phải nằm trên cùng

const express = require('express');
const mongoose = require('mongoose');
const categoryRoutes = require('./Routes/product.routes');
const productRoutes = require('./Routes/category.routes');
const logToCSV = require('./Utils/logger');

const app = express();
const PORT = process.env.PORT;

const cors = require('cors');

app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

//app.use(logToCSV); bi loi log
app.use('/admin/products', categoryRoutes);
app.use('/admin/categories', productRoutes);

app.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
});