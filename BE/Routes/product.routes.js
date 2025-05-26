const express = require('express');
const router = express.Router();
const productController = require('../Controllers/product.controller');

router.post('/', productController.createProduct);
router.get('/:id', productController.getProduct);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);
router.get('/', productController.getAllProducts);

module.exports = router;
