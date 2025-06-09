const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/category.controller');

// Routes
router.post('/', categoryController.createCategory); // add category
router.get('/', categoryController.getAllCategories); 
router.get('/:id', categoryController.getCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);


module.exports = router;
