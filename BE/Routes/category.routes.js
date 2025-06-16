const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/category.controller');

// Định nghĩa routes cho categories
router.get('/', categoryController.getAllCategories); // Route này sẽ xử lý cả query parameters
router.get('/:id', categoryController.getCategoryById);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;