require('dotenv').config();  // Dòng này phải nằm trên cùng

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const fileUpload = require('express-fileupload');
const productRoutes = require('./Routes/product.routes');
const categoryRoutes = require('./Routes/category.routes');
const logToCSV = require('./Utils/logger');

const app = express();
const PORT = process.env.PORT;

app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
}));

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Đã kết nối MongoDB'))
  .catch(err => console.error('Lỗi kết nối MongoDB:', err));

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

app.use('/admin/products', productRoutes);
app.use('/admin/categories', categoryRoutes);

// Catch-all error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server chạy trên cổng ${PORT}`);
});