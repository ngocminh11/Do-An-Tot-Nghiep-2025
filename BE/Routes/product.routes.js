const express = require('express');
const router = express.Router();
const productController = require('../Controllers/product.controller');

router.post('/', productController.createProduct);           // Tạo sản phẩm mới
router.get('/', productController.getAllProducts);           // Lấy tất cả sản phẩm
router.get('/search', productController.searchProductBySku); // Tìm sản phẩm theo SKU (query param ?sku=)
router.get('/:id', productController.getProduct);            // Lấy sản phẩm theo id
router.put('/:id', productController.updateProduct);         // Cập nhật sản phẩm theo id
router.delete('/:id', productController.deleteProduct);      // Xóa sản phẩm theo id

module.exports = router;
