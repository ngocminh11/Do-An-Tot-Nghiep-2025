const express = require('express');
const router = express.Router();
const productController = require('../Controllers/product.controller');
const upload = require('../Middlewares/upload');

// Routes
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', upload.array('files'), productController.createProduct);
router.put('/products/:id', upload.array('files'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);


module.exports = router;