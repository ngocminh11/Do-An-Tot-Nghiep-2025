const mongoose = require('mongoose');
const runCategorySeed = require('./Seeds/Categories/category.seed');
const runProductSeed = require('./Seeds/Products/product.seed');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/datn_mypham');
    console.log('✅ Đã kết nối MongoDB');

    console.log('Đang chạy file seed: category.seed.js');
    const category = await runCategorySeed();

    console.log('Đang chạy file seed: product.seed.js');
    await runProductSeed(category); // truyền category vào nếu cần

    await mongoose.disconnect();
    console.log('✅ Đã ngắt kết nối MongoDB');
  } catch (error) {
    console.error('❌ Lỗi khi seed dữ liệu:', error);
  }
})();
