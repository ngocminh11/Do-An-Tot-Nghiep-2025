const express = require('express');
const router = express.Router();
const productController = require('../Controllers/product.controller');
const upload = require('../Middlewares/upload');

// Public routes for all users
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/', upload.array('files'), productController.createProduct);
router.put('/:id', upload.array('files'), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;