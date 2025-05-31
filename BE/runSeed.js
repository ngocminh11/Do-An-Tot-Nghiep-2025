const mongoose = require('mongoose');
const runCategorySeed = require('./Seeds/Categories/category.seed');
const runProductSeed = require('./Seeds/Products/product.seed');

(async () => {
  try {
    await mongoose.connect('mongodb+srv://ngocminh110804:ozmZ65hdg913RRl2@products.r6u0wfk.mongodb.net/?retryWrites=true&w=majority&appName=Products');
    console.log('Đã kết nối MongoDB');

    console.log('Đang chạy file seed: category.seed.js');
    const category = await runCategorySeed();

    console.log('Đang chạy file seed: product.seed.js');
    await runProductSeed(category); // truyền category vào nếu cần

    await mongoose.disconnect();
    console.log('Đã ngắt kết nối MongoDB');
  } catch (error) {
    console.error('Lỗi khi seed dữ liệu:', error);
  }
})();
