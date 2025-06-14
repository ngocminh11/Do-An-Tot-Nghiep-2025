const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/category.controller');
const productController = require('../Controllers/product.controller');
const userController = require('../Controllers/account.controller');

const upload = require('../Middlewares/upload');

//Routes for Product
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', upload.array('files'), productController.createProduct);
router.put('/products/:id', upload.array('files'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);

//Routes for Category
router.get('/categories', categoryController.getAllCategories);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

//Routes for Account
router.get('/accounts', userController.getAllUsers);
router.get('/accounts/:id', userController.getUserById);
router.post('/accounts', userController.createUser);
router.put('/accounts/:id', userController.updateUser);
router.delete('/accounts/:id', userController.deleteUser);

module.exports = router;