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

// Routes for Product
router.get('/products',   productController.getAllProducts);
router.get('/products/:id',   productController.getProductById);
router.post('/products',   validateImageUpload, productController.createProduct);
router.put('/products/:id',   validateImageUpload, productController.updateProduct);
router.delete('/products/:id',   productController.deleteProduct);
router.get('/products/export/csv',   productController.exportProductsToExcel);

router.get('/media/:id', mediaController.streamImageById); // public

// Routes for Category
router.get('/categories',   categoryController.getAllCategories);
router.get('/categories/:id',   categoryController.getCategoryById);
router.post('/categories',   categoryController.createCategory);
router.put('/categories/:id',   categoryController.updateCategory);
router.delete('/categories/:id',   categoryController.deleteCategory);

// Routes for Account
router.get('/accounts',   userController.getAllUsers);
router.get('/accounts/:id',   userController.getUserById);
router.post('/accounts',   userController.createUser);
router.put('/accounts/:id',   userController.updateUser);
router.delete('/accounts/:id',   userController.deleteUser);

// Routes for Comment
router.get('/',   commentController.getAllComments);
router.get('/comments',   commentController.getAllComments);
router.get('/comments/:id',   commentController.getCommentById);
router.delete('/comments/:id',   commentController.deleteComment);
router.post('/comments/reply/:id',   commentController.replyToComment);

// Routes for Tag
router.get('/tags',   tagController.getAllTags);
router.get('/tags/:id',   tagController.getTagById);
router.post('/tags',   tagController.createTag);
router.put('/tags/:id',   tagController.updateTag);
router.delete('/tags/:id',   tagController.deleteTag);

// Routes for Cart
router.get('/carts',   cartController.getAllCarts);
router.get('/carts/:userId',   cartController.getCartByUserId);
router.delete('/carts/:userId',   cartController.clearCartByUserId);

// Routes for Promotion
router.post('/promotions',   promotionController.createPromotion);
router.get('/promotions',   promotionController.getAllPromotions);
router.get('/promotions/:id',   promotionController.getPromotionById);
router.put('/promotions/:id',   promotionController.updatePromotion);
router.delete('/promotions/:id',   promotionController.deletePromotion);

// Routes for Order (admin)
router.get('/orders',   orderController.getAllOrders);
router.patch('/orders/:id/status',   orderController.updateOrderStatus);
router.post('/orders/:id/respond-cancel',   orderController.respondCancelRequest);
router.put('/orders/:id',   orderController.updateOrder);
router.delete('/orders/:id',   orderController.deleteOrder);

// Routes for Post
router.get('/posts',   postController.getAllPosts);
router.get('/posts/:id',   postController.getPostById);
router.post('/posts',   postController.createPost);
router.put('/posts/:id',   postController.updatePost);
router.delete('/posts/:id',   postController.deletePost);

module.exports = router;
