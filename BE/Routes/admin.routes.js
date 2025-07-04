/* --------------------------------------------------------------------------
 *  routes/index.js  –  Phân quyền chi tiết
 * --------------------------------------------------------------------------
 *  ROLE_QUYEN:
 *   - Khách Hàng        : chỉ thao tác cá nhân
 *   - Nhân Viên         : xem dữ liệu
 *   - Quản Lý Kho       : CRUD Product | Category | Tag | Promotion | Post
 *   - Quản Lý Nhân Sự   : CRUD Account
 *   - Quản Lý Đơn Hàng  : CRUD Order
 *   - Quản Lý Chính     : toàn quyền
 * ------------------------------------------------------------------------ */

const express = require('express');
const router = express.Router();

/* ==== Controllers ==== */
const categoryCtrl = require('../Controllers/category.controller');
const productCtrl = require('../Controllers/product.controller');
const accountCtrl = require('../Controllers/account.controller');
const commentCtrl = require('../Controllers/comment.controller');
const tagCtrl = require('../Controllers/tag.controller');
const cartCtrl = require('../Controllers/cart.controller');
const mediaCtrl = require('../Controllers/media.controller');
const promotionCtrl = require('../Controllers/promotion.controller');
const postCtrl = require('../Controllers/post.controller');
const orderCtrl = require('../Controllers/order.controller');
const dashboardCtrl = require('../Controllers/dashboard.controller');

/* ==== Middlewares ==== */
const validateImageUpload = require('../Middlewares/upload.middleware');
const { authenticateUser, authorizeRoles } = require('../Middlewares/auth.middleware');

/* ---- Helper ---- */
const ADMIN_ROLES = [
  'Nhân Viên',
  'Quản Lý Kho',
  'Quản Lý Nhân Sự',
  'Quản Lý Đơn Hàng',
  'Quản Lý Chính'
];

/* =========================================================================
 * 1) PRODUCT
 * ========================================================================= */
router.get('/products',
  authenticateUser,
  productCtrl.getAllProducts);

router.get('/products/export/csv',
  authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']),
  productCtrl.exportProductsToExcel);

router.get('/products/category/:categoryId',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  productCtrl.getProductsByCategory);

router.get('/products/:id',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  productCtrl.getProductById);

router.post('/products',
  authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']),
  validateImageUpload,
  productCtrl.createProduct);

router.put('/products/:id',
  authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']),
  validateImageUpload,
  productCtrl.updateProduct);

router.delete('/products/:id',
  authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']),
  productCtrl.deleteProduct);

/* --- kho & trạng thái (yêu cầu PIN) --- */
router.patch('/products/:id/inventory',
  authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']),
  productCtrl.updateInventory);

router.patch('/products/:id/status',
  authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']),
  productCtrl.changeStatus);

/* --- Logs --- */
router.get('/products/:id/logs',
  authenticateUser, authorizeRoles(...ADMIN_ROLES),
  productCtrl.getProductLogs);

router.get('/products/logs/all',
  authenticateUser, authorizeRoles(...ADMIN_ROLES),
  productCtrl.getAllProductLogs);


/* =========================================================================
 * 2) CATEGORY  (CRUD – Kho & Chính)
 * ========================================================================= */
router
  .route('/categories')
  .get(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), categoryCtrl.getAllCategories)
  .post(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), categoryCtrl.createCategory);

router.get('/categories/:id/products',
  authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']),
  categoryCtrl.getCategoryWithProducts);

router
  .route('/categories/:id')
  .get(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), categoryCtrl.getCategoryById)
  .put(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), categoryCtrl.updateCategory)
  .delete(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), categoryCtrl.deleteCategory);


/* =========================================================================
 * 3) TAG  (đã đủ 5 route)
 * ========================================================================= */
router
  .route('/tags')
  .get(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), tagCtrl.getAllTags)
  .post(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), tagCtrl.createTag);

router
  .route('/tags/:id')
  .get(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), tagCtrl.getTagById)
  .put(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), tagCtrl.updateTag)
  .delete(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), tagCtrl.deleteTag);


/* =========================================================================
 * 4) ACCOUNT / USER  (Nhân Sự & Chính)
 * ========================================================================= */
router.get('/accounts',
  authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']),
  accountCtrl.getAllUsers);

router.post('/accounts',
  authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']),
  accountCtrl.createUserNoPin);

router.post('/accounts/with-pin',
  authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']),
  accountCtrl.createUserWithPin);

router
  .route('/accounts/:id')
  .get(authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']), accountCtrl.getUserById)
  .put(authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']), accountCtrl.updateUserNoPin)
  .delete(authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']), accountCtrl.deleteUser);

router.put('/accounts/with-pin/:id',
  authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']),
  accountCtrl.updateUserWithPin);

router.patch('/accounts/:id/pin',
  authenticateUser, authorizeRoles(...['Quản Lý Nhân Sự', 'Quản Lý Chính']),
  accountCtrl.updatePin);

router.post('/accounts/:id/verify-pin',
  accountCtrl.verifyPin);


/* =========================================================================
 * 5) ORDER  (Đơn Hàng & Chính)
 * ========================================================================= */
// Read
router.get('/orders',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  orderCtrl.getAllOrders);

router.get('/orders/stats',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  orderCtrl.getOrderStats);

router.get('/orders/:id',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  orderCtrl.getOrderById);

// Write (yêu cầu PIN trong controller)
router.patch('/orders/:id/status',
  authenticateUser, authorizeRoles(...['Quản Lý Đơn Hàng', 'Quản Lý Chính']),
  orderCtrl.updateOrderStatus);

router.post('/orders/:id/respond-cancel',
  authenticateUser, authorizeRoles(...['Quản Lý Đơn Hàng', 'Quản Lý Chính']),
  orderCtrl.respondCancelRequest);

router.put('/orders/:id',
  authenticateUser, authorizeRoles(...['Quản Lý Đơn Hàng', 'Quản Lý Chính']),
  orderCtrl.updateOrder);

router.delete('/orders/:id',
  authenticateUser, authorizeRoles(...['Quản Lý Đơn Hàng', 'Quản Lý Chính']),
  orderCtrl.deleteOrder);


/* =========================================================================
 * 6) PROMOTION  – Quản Lý Kho & Quản Lý Chính
 * ========================================================================= */
router
  .route('/promotions')
  .get(authenticateUser, authorizeRoles(...ADMIN_ROLES), promotionCtrl.getAllPromotions)
  .post(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), promotionCtrl.createPromotion);

router
  .route('/promotions/:id')
  .get(authenticateUser, authorizeRoles(...ADMIN_ROLES), promotionCtrl.getPromotionById)
  .put(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), promotionCtrl.updatePromotion)
  .delete(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), promotionCtrl.deletePromotion);


/* =========================================================================
 * 7) POST / BLOG  – Quản Lý Kho & Quản Lý Chính
 * ========================================================================= */
router
  .route('/posts')
  .get(authenticateUser, authorizeRoles(...ADMIN_ROLES), postCtrl.getAllPosts)
  .post(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), postCtrl.createPost);

router
  .route('/posts/:id')
  .get(authenticateUser, authorizeRoles(...ADMIN_ROLES), postCtrl.getPostById)
  .put(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), postCtrl.updatePost)
  .delete(authenticateUser, authorizeRoles(...['Quản Lý Kho', 'Quản Lý Chính']), postCtrl.deletePost);


/* =========================================================================
 * 8) COMMENT – tất cả staff đều xem được / chỉ admin được reply/delete
 * ========================================================================= */
router.get('/comments',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  commentCtrl.getAllComments);

router.get('/comments/stats',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  commentCtrl.getCommentStats);

router.get('/comments/product/:productId',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  commentCtrl.getCommentsByProduct);

router.get('/comments/:id',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  commentCtrl.getCommentById);

router.delete('/comments/:id',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  commentCtrl.deleteComment);

router.put('/comments/:id/reply',
  authenticateUser, authorizeRoles(ADMIN_ROLES),
  commentCtrl.replyToComment);


/* =========================================================================
 * 9) DASHBOARD – Quản Lý Chính (toàn quyền)
 * ========================================================================= */
router.get('/revenue-by-month',
  authenticateUser, authorizeRoles(['Quản Lý Chính']),
  dashboardCtrl.revenueByMonth);

router.get('/top-products',
  authenticateUser, authorizeRoles(['Quản Lý Chính']),
  dashboardCtrl.topProducts);

router.get('/low-stock',
  authenticateUser, authorizeRoles(['Quản Lý Chính']),
  dashboardCtrl.lowStockProducts);

router.get('/order-status-ratio',
  authenticateUser, authorizeRoles(['Quản Lý Chính']),
  dashboardCtrl.orderStatusRatio);

router.get('/user-growth',
  authenticateUser, authorizeRoles(['Quản Lý Chính']),
  dashboardCtrl.userGrowth);

/* =========================================================================
 * 10) MEDIA public & CART user‑level (không đổi)
 * ========================================================================= */
router.get('/media/:id', mediaCtrl.streamImageById);

router.get('/carts', cartCtrl.getAllCarts);
router.get('/carts/:userId', cartCtrl.getCartByUserId);
router.delete('/carts/:userId', cartCtrl.clearCartByUserId);

module.exports = router;