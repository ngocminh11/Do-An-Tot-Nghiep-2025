const express = require('express');
const router = express.Router();
const categoryController = require('../Controllers/category.controller');
const productController = require('../Controllers/product.controller');
const userController = require('../Controllers/account.controller');
const commentController = require('../Controllers/comment.controller');
const tagController = require('../Controllers/tag.controller');
const cartController = require('../Controllers/cart.controller');
const mediaController = require('../Controllers/media.controller');
const promotionController = require('../Controllers/promotion.controller');
const postController = require('../Controllers/post.controller');
const orderController = require('../Controllers/order.controller');
const validateImageUpload = require('../Middlewares/upload.middleware');
const { authenticateUser, authorizeAdmin } = require('../Middlewares/auth.middleware');

// Routes for Product
router.get('/products', authenticateUser, authorizeAdmin, productController.getAllProducts);
router.get('/products/:id', authenticateUser, authorizeAdmin, productController.getProductById);
router.post('/products', authenticateUser, authorizeAdmin, validateImageUpload, productController.createProduct);
router.put('/products/:id', authenticateUser, authorizeAdmin, validateImageUpload, productController.updateProduct);
router.delete('/products/:id', authenticateUser, authorizeAdmin, productController.deleteProduct);
router.get('/products/export/csv', authenticateUser, authorizeAdmin, productController.exportProductsToExcel);

router.get('/media/:id', mediaController.streamImageById); // public

// Routes for Category
router.get('/categories', authenticateUser, authorizeAdmin, categoryController.getAllCategories);
router.get('/categories/:id', authenticateUser, authorizeAdmin, categoryController.getCategoryById);
router.post('/categories', authenticateUser, authorizeAdmin, categoryController.createCategory);
router.put('/categories/:id', authenticateUser, authorizeAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authenticateUser, authorizeAdmin, categoryController.deleteCategory);

// Routes for Account
router.get('/accounts', authenticateUser, authorizeAdmin, userController.getAllUsers);
router.get('/accounts/:id', authenticateUser, authorizeAdmin, userController.getUserById);
router.post('/accounts', authenticateUser, authorizeAdmin, userController.createUser);
router.put('/accounts/:id', authenticateUser, authorizeAdmin, userController.updateUser);
router.delete('/accounts/:id', authenticateUser, authorizeAdmin, userController.deleteUser);

// Routes for Comment
router.get('/', authenticateUser, authorizeAdmin, commentController.getAllComments);
router.get('/comments', authenticateUser, authorizeAdmin, commentController.getAllComments);
router.get('/comments/:id', authenticateUser, authorizeAdmin, commentController.getCommentById);
router.delete('/comments/:id', authenticateUser, authorizeAdmin, commentController.deleteComment);
router.post('/comments/reply/:id', authenticateUser, authorizeAdmin, commentController.replyToComment);

// Routes for Tag
router.get('/tags', authenticateUser, authorizeAdmin, tagController.getAllTags);
router.get('/tags/:id', authenticateUser, authorizeAdmin, tagController.getTagById);
router.post('/tags', authenticateUser, authorizeAdmin, tagController.createTag);
router.put('/tags/:id', authenticateUser, authorizeAdmin, tagController.updateTag);
router.delete('/tags/:id', authenticateUser, authorizeAdmin, tagController.deleteTag);

// Routes for Cart
router.get('/carts', authenticateUser, authorizeAdmin, cartController.getAllCarts);
router.get('/carts/:userId', authenticateUser, authorizeAdmin, cartController.getCartByUserId);
router.delete('/carts/:userId', authenticateUser, authorizeAdmin, cartController.clearCartByUserId);

// Routes for Promotion
router.post('/promotions', authenticateUser, authorizeAdmin, promotionController.createPromotion);
router.get('/promotions', authenticateUser, authorizeAdmin, promotionController.getAllPromotions);
router.get('/promotions/:id', authenticateUser, authorizeAdmin, promotionController.getPromotionById);
router.put('/promotions/:id', authenticateUser, authorizeAdmin, promotionController.updatePromotion);
router.delete('/promotions/:id', authenticateUser, authorizeAdmin, promotionController.deletePromotion);

// Routes for Order (admin)
router.get('/orders', authenticateUser, authorizeAdmin, orderController.getAllOrders);
router.patch('/orders/:id/status', authenticateUser, authorizeAdmin, orderController.updateOrderStatus);
router.post('/orders/:id/respond-cancel', authenticateUser, authorizeAdmin, orderController.respondCancelRequest);
router.put('/orders/:id', authenticateUser, authorizeAdmin, orderController.updateOrder);
router.delete('/orders/:id', authenticateUser, authorizeAdmin, orderController.deleteOrder);

// Routes for Post
router.get('/posts', authenticateUser, authorizeAdmin, postController.getAllPosts);
router.get('/posts/:id', authenticateUser, authorizeAdmin, postController.getPostById);
router.post('/posts', authenticateUser, authorizeAdmin, postController.createPost);
router.put('/posts/:id', authenticateUser, authorizeAdmin, postController.updatePost);
router.delete('/posts/:id', authenticateUser, authorizeAdmin, postController.deletePost);

module.exports = router;
