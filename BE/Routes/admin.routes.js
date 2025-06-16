const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/category.controller');
const productController = require('../Controllers/product.controller');
const userController = require('../Controllers/account.controller');
const commentController = require('../Controllers/comment.controller');
const tagController = require('../Controllers/tag.controller');
const cartController = require('../Controllers/cart.controller');


const upload = require('../Middlewares/upload');

//Routes for Product
router.get('/products', productController.getAllProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', upload.array('files'), productController.createProduct);
router.put('/products/:id', upload.array('files'), productController.updateProduct);
router.delete('/products/:id', productController.deleteProduct);
router.get('/products/export/csv', productController.exportProductsToExcel);

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

//Routes for Comment
router.get('/', commentController.getAllComments);
router.get('/comments', commentController.getAllComments);                
router.get('/comments/:id', commentController.getCommentById);           
router.delete('/comments/:id', commentController.deleteComment);           
router.post('/comments/reply/:id', commentController.replyToComment);  

//Routes for Tag
router.get('/tags', tagController.getAllTags);
router.get('/tags/:id', tagController.getTagById);
router.post('/tags', tagController.createTag);
router.put('/tags/:id', tagController.updateTag);
router.delete('/tags/:id', tagController.deleteTag);

//Routes for Cart
router.post('/cart/add', cartController.addToCart);
router.put('/cart/update', cartController.updateQuantity);
router.delete('/cart/remove', cartController.removeFromCart);
router.get('/my-cart', cartController.getMyCart);
router.delete('/cart/clear', cartController.clearMyCart);
router.get('/cart', cartController.getAllCarts);
router.get('/cart/:userId', cartController.getCartByUserId);
router.delete('/cart/:userId', cartController.clearCartByUserId);


module.exports = router;