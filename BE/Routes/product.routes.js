const express = require('express');
const router = express.Router();
const productController = require('../Controllers/product.controller');
const upload = require('../Middlewares/upload');

// Routes
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.post('/', upload.array('images', 10), productController.createProduct);
router.put('/:id', upload.array('images', 10), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
