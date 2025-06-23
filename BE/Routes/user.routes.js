const express = require('express');
const router = express.Router();
const userController = require('../Controllers/account.controller');
const cartController = require('../Controllers/cart.controller');
const orderController = require('../Controllers/order.controller');
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
router.post('/orders', authenticateUser, orderController.createOrder);
router.get('/orders/my-orders', authenticateUser, orderController.getUserOrders);
router.get('/orders/:id', authenticateUser, orderController.getOrderById);
router.post('/orders/:id/cancel-request', authenticateUser, orderController.cancelRequestByUser);

module.exports = router;
