const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Product = require('../../Models/Products'); // đường dẫn đúng với Models của bạn

// Kết nối MongoDB
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/datn_mypham'; // thay URI đúng của bạn
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Đã kết nối MongoDB'))
.catch(err => {
  console.error('Lỗi kết nối MongoDB:', err.message);
  process.exit(1);
});

const seed = async () => {
  try {
    const filePath = path.join(__dirname, 'seed_products.json');
    const data = fs.readFileSync(filePath, 'utf8');
    const products = JSON.parse(data);

    for (const product of products) {
      // Kiểm tra name đã tồn tại chưa (name là unique)
      const exists = await Product.findOne({ name: product.name });
      if (exists) {
        console.log(`Đã tồn tại: ${product.name}`);
        continue;
      }

      await Product.create(product);
      console.log(`Đã thêm: ${product.name}`);
    }

    console.log('Seed hoàn tất');
    process.exit(0);
  } catch (err) {
    console.error('Lỗi seed:', err);
    process.exit(1);
  }
};

seed();
