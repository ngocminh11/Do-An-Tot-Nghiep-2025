// ============================================================================
//   Chỉ dành cho người dùng cuối (role = 'Khách Hàng')
// ============================================================================

const express = require('express');
const router = express.Router();

const accountCtrl = require('../Controllers/account.controller');
const cartCtrl = require('../Controllers/cart.controller');
const orderCtrl = require('../Controllers/order.controller');
const categoryCtrl = require('../Controllers/category.controller');
const productCtrl = require('../Controllers/product.controller');
const commentCtrl = require('../Controllers/comment.controller');
const mediaCtrl = require('../Controllers/media.controller');

const {
  authenticateUser,
  authorizeRoles           // middleware đã khai báo trước
} = require('../Middlewares/auth.middleware');

const ALL_ROLES = [
  'Khách Hàng',
  'Quản Lý Chính',
  'Quản Lý Kho',
  'Quản Lý Nội Dung',
  'Quản Lý Marketing',
  'Quản Lý Nhân Sự'
];

/* -------------------------------------------------------------------------- */
/* 1.  ACCOUNT – chỉ cho owner (hoặc admin – đã xử lý trong controller)       */
/* -------------------------------------------------------------------------- */
router.get(
  '/accounts/:id',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  accountCtrl.getUserById
);

router.put(
  '/accounts/:id',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  accountCtrl.updateUserNoPin
);

router.patch(
  '/accounts/:id/status',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  accountCtrl.updateOwnStatus
);

/* -------------------------------------------------------------------------- */
/* 2.  CART                                                                  */
/* -------------------------------------------------------------------------- */
router.post(
  '/carts/add',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  cartCtrl.addToCart
);

router.put(
  '/carts/update',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  cartCtrl.updateQuantity
);

router.delete(
  '/carts/remove',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  cartCtrl.removeFromCart
);

router.get(
  '/carts/my-cart',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  cartCtrl.getMyCart
);

router.delete(
  '/carts/clear',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  cartCtrl.clearMyCart
);

/* -------------------------------------------------------------------------- */
/* 3.  ORDER                                                                 */
/* -------------------------------------------------------------------------- */
router.post(
  '/orders',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  orderCtrl.createOrder
);

router.get(
  '/orders/my-orders',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  orderCtrl.getUserOrders
);

router.get(
  '/orders/:id',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  orderCtrl.getOrderById
);

router.post(
  '/orders/:id/cancel-request',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  orderCtrl.cancelRequestByUser
);

/* -------------------------------------------------------------------------- */
/* 4.  CATEGORY & PRODUCT – public (không cần login)                         */
/* -------------------------------------------------------------------------- */
router.get('/categories', categoryCtrl.getAllCategories);
router.get('/categories/:id', categoryCtrl.getCategoryById);
router.get('/categories/:id/products', categoryCtrl.getCategoryWithProducts);

router.get('/products', productCtrl.getAllProducts);
router.get('/products/category/:categoryId', productCtrl.getProductsByCategory);
router.get('/products/:id', productCtrl.getProductById);

/* -------------------------------------------------------------------------- */
/* 6.  MEDIA – public (không cần login)                                      */
/* -------------------------------------------------------------------------- */
router.get('/media/:id', mediaCtrl.streamImageById);

/* -------------------------------------------------------------------------- */
/* 5.  COMMENT – user phải đăng nhập                                          */
/* -------------------------------------------------------------------------- */
router.get(
  '/comments',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  commentCtrl.getAllComments
);

router.post(
  '/comments',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  commentCtrl.createComment
);

router.get('/comments/product/:productId', commentCtrl.getCommentsByProduct);

router.get(
  '/comments/:id',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  commentCtrl.getCommentById
);

router.put(
  '/comments/:id',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  commentCtrl.updateComment
);

router.delete(
  '/comments/:id',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  commentCtrl.deleteComment
);

router.put(
  '/comments/:id/reply',
  authenticateUser,
  authorizeRoles(...ALL_ROLES),
  commentCtrl.replyToComment
);

module.exports = router;