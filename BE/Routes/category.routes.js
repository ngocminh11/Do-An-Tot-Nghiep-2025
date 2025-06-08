const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/category.controller');

// Lấy tất cả danh mục (có tìm kiếm, phân trang, sắp xếp)
router.get('/', categoryController.getAllCategories);

// Tạo mới danh mục
router.post('/', categoryController.createCategory);

// Cập nhật danh mục theo idCategory
router.put('/:idCategory', categoryController.updateCategory);

// Xoá danh mục theo idCategory
router.delete('/:idCategory', categoryController.deleteCategory);


module.exports = router;
