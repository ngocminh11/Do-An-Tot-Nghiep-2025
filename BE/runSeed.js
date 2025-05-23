// runSeed.js

const fs = require('fs');
const path = require('path');

// Đọc tất cả các file trong thư mục Seeds
const seedFolder = path.join(__dirname, 'Seeds');
fs.readdir(seedFolder, (err, files) => {
  if (err) {
    console.error('Lỗi khi đọc thư mục Seeds:', err);
    return;
  }

  // Lọc các file có đuôi .js
  const seedFiles = files.filter(file => file.endsWith('.js'));

  // Thực thi từng file seed
  seedFiles.forEach(file => {
    const filePath = path.join(seedFolder, file);
    console.log(`Đang chạy file seed: ${filePath}`);

    require(filePath);  // Thực thi file seed
  });
});
