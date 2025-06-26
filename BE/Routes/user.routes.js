const express = require('express');
const router = express.Router();
const userController = require('../Controllers/account.controller');
const cartController = require('../Controllers/cart.controller');
const orderController = require('../Controllers/order.controller');
const categoryController = require('../Controllers/category.controller');
const commentController = require('../Controllers/comment.controller');
const productController = require('../Controllers/product.controller');
const { authenticateUser } = require('../Middlewares/auth.middleware');

// Routes for User Account (user & admin can access their own or by ID)
router.get('/accounts/:id', authenticateUser, userController.getUserById);
router.put('/accounts/:id', authenticateUser, userController.updateUser);
router.delete('/accounts/:id', authenticateUser, userController.deleteUser);

// Routes for Cart (user only)
router.post('/carts/add', authenticateUser, cartController.addToCart);
router.put('/carts/update', authenticateUser, cartController.updateQuantity);
router.delete('/carts/remove', authenticateUser, cartController.removeFromCart);
router.get('/carts/my-cart', authenticateUser, cartController.getMyCart);
router.delete('/carts/clear', authenticateUser, cartController.clearMyCart);

// Routes for Order (user & admin)
router.post('/orders',authenticateUser, orderController.createOrder);
router.get('/orders/my-orders',authenticateUser, authenticateUser, orderController.getUserOrders);
router.get('/orders/:id', authenticateUser, orderController.getOrderById);
router.post('/orders/:id/cancel-request', authenticateUser, orderController.cancelRequestByUser);

// Routes for Categories (public access)
router.get('/categories', authenticateUser,categoryController.getAllCategories);
router.get('/categories/:id',authenticateUser, categoryController.getCategoryById);
router.get('/categories/:id/products',authenticateUser, categoryController.getCategoryWithProducts);

// Routes for Products (public access)
router.get('/products',authenticateUser, productController.getAllProducts);
router.get('/products/category/:categoryId',authenticateUser, productController.getProductsByCategory);
router.get('/products/:id',authenticateUser, productController.getProductById);

// Routes for Comment (user)
router.get('/comments',authenticateUser, commentController.getAllComments);
router.post('/comments', authenticateUser, commentController.createComment);
router.get('/comments/product/:productId', commentController.getCommentsByProduct);
router.get('/comments/:id',authenticateUser, commentController.getCommentById);
router.put('/comments/:id', authenticateUser, commentController.updateComment);
router.delete('/comments/:id', authenticateUser, commentController.deleteComment);
router.put('/comments/:id/reply', authenticateUser, commentController.replyToComment);

module.exports = router;
