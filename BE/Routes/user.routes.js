// ============================================================================
//   Chỉ dành cho người dùng cuối (role = 'Khách Hàng')
// ============================================================================

const express = require('express');
const router  = express.Router();

const accountCtrl  = require('../Controllers/account.controller');
const cartCtrl     = require('../Controllers/cart.controller');
const orderCtrl    = require('../Controllers/order.controller');
const categoryCtrl = require('../Controllers/category.controller');
const productCtrl  = require('../Controllers/product.controller');
const commentCtrl  = require('../Controllers/comment.controller');

const {
  authenticateUser,
  authorizeRoles           // middleware đã khai báo trước
} = require('../Middlewares/auth.middleware');

const CUSTOMER = ['Khách Hàng'];

/* -------------------------------------------------------------------------- */
/* 1.  ACCOUNT – chỉ cho owner (hoặc admin – đã xử lý trong controller)       */
/* -------------------------------------------------------------------------- */
router.get(
  '/accounts/:id',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  accountCtrl.getUserById
);

router.put(
  '/accounts/:id',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  accountCtrl.updateUserNoPin
);

router.patch(
  '/accounts/:id/status',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  accountCtrl.updateOwnStatus
);

/* -------------------------------------------------------------------------- */
/* 2.  CART                                                                  */
/* -------------------------------------------------------------------------- */
router.post(
  '/carts/add',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  cartCtrl.addToCart
);

router.put(
  '/carts/update',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  cartCtrl.updateQuantity
);

router.delete(
  '/carts/remove',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  cartCtrl.removeFromCart
);

router.get(
  '/carts/my-cart',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  cartCtrl.getMyCart
);

router.delete(
  '/carts/clear',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  cartCtrl.clearMyCart
);

/* -------------------------------------------------------------------------- */
/* 3.  ORDER                                                                 */
/* -------------------------------------------------------------------------- */
router.post(
  '/orders',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  orderCtrl.createOrder
);

router.get(
  '/orders/my-orders',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  orderCtrl.getUserOrders
);

router.get(
  '/orders/:id',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  orderCtrl.getOrderById
);

router.post(
  '/orders/:id/cancel-request',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  orderCtrl.cancelRequestByUser
);

/* -------------------------------------------------------------------------- */
/* 4.  CATEGORY & PRODUCT – public (không cần login)                         */
/* -------------------------------------------------------------------------- */
router.get('/categories',                 categoryCtrl.getAllCategories);
router.get('/categories/:id',             categoryCtrl.getCategoryById);
router.get('/categories/:id/products',    categoryCtrl.getCategoryWithProducts);

router.get('/products',                   productCtrl.getAllProducts);
router.get('/products/category/:categoryId', productCtrl.getProductsByCategory);
router.get('/products/:id',               productCtrl.getProductById);

/* -------------------------------------------------------------------------- */
/* 5.  COMMENT – user phải đăng nhập                                          */
/* -------------------------------------------------------------------------- */
router.get(
  '/comments',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  commentCtrl.getAllComments
);

router.post(
  '/comments',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  commentCtrl.createComment
);

router.get('/comments/product/:productId', commentCtrl.getCommentsByProduct);

router.get(
  '/comments/:id',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  commentCtrl.getCommentById
);

router.put(
  '/comments/:id',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  commentCtrl.updateComment
);

router.delete(
  '/comments/:id',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  commentCtrl.deleteComment
);

router.put(
  '/comments/:id/reply',
  authenticateUser,
  authorizeRoles(...CUSTOMER),
  commentCtrl.replyToComment
);

module.exports = router;
