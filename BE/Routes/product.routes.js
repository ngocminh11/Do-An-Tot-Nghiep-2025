const express = require('express');
const router = express.Router();
const productController = require('../Controllers/product.controller');
const upload = require('../config/multer.config');
const path = require('path');
const fs = require('fs');

// Tạo thư mục uploads nếu chưa tồn tại
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes với hỗ trợ upload file
router.post('/', upload.array('mediaFiles', 10), productController.createProduct);
router.put('/:idProduct', upload.array('mediaFiles', 10), productController.updateProduct);
router.delete('/:idProduct', productController.deleteProduct);
router.get('/:id', productController.getProduct);
router.get('/', productController.getAllProducts);

module.exports = router;
