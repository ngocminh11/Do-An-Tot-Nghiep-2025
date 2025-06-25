const Cart = require('../Models/Carts');
const Product = require('../Models/Products');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// controllers/cart.controller.js
exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity = 1 } = req.body;

  // 1) Validate id
  if (!isValidId(productId))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    // 2) Lấy sản phẩm + tồn kho
    const product = await Product.findById(productId);
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    const stockLeft = product.pricingAndInventory.stockQuantity;

    // 3) Lấy (hoặc tạo mới) giỏ hàng của user
    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    // 4) Kiểm tra xem sản phẩm đã có trong cart chưa
    const idx = cart.items.findIndex(i => i.productId.equals(productId));
    const currentQtyInCart = idx !== -1 ? cart.items[idx].quantity : 0;

    // 5) Xác định tổng qty sau khi thêm
    const newTotalQty = currentQtyInCart + quantity;

    // 6) Nếu vượt quá tồn kho → báo lỗi
    if (newTotalQty > stockLeft) {
      return sendError(
        res,
        StatusCodes.ERROR_BAD_REQUEST,
        `Chỉ còn ${stockLeft - currentQtyInCart} sản phẩm trong kho.`
      );
    }

    // 7) Nếu đủ kho → cập nhật cart
    if (idx !== -1) {
      cart.items[idx].quantity = newTotalQty;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart, Messages.CART_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// controllers/cart.controller.js  (hàm updateQuantity)
exports.updateQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  // 1) Validate đầu vào
  if (!isValidId(productId) || !Number.isInteger(quantity) || quantity < 1) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_INPUT);
  }

  try {
    // 2) Lấy sản phẩm để kiểm tra tồn kho
    const product = await Product.findById(productId, 'pricingAndInventory.stockQuantity');
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    const stockLeft = product.pricingAndInventory.stockQuantity;

    // 3) Lấy giỏ hàng của user
    const cart = await Cart.findOne({ userId });
    if (!cart)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CART_NOT_FOUND);

    // 4) Tìm item trong giỏ
    const item = cart.items.find(i => i.productId.equals(productId));
    if (!item)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_IN_CART);

    // 5) Kiểm tra vượt tồn kho?
    if (quantity > stockLeft) {
      return sendError(
        res,
        StatusCodes.ERROR_BAD_REQUEST,
        `Chỉ còn ${stockLeft} sản phẩm trong kho.`
      );
    }

    // 6) Cập nhật & lưu
    item.quantity = quantity;
    await cart.save();

    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart, Messages.CART_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};


exports.removeFromCart = async (req, res) => {
  const userId = req.user._id;
  const { productId } = req.body;

  if (!isValidId(productId))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CART_NOT_FOUND);

    cart.items = cart.items.filter(item => !item.productId.equals(productId));
    await cart.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart, Messages.CART_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.getMyCart = async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return sendSuccess(res, StatusCodes.SUCCESS_OK, { items: [] }, Messages.CART_EMPTY);
    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.clearMyCart = async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CART_NOT_FOUND);
    cart.items = [];
    await cart.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.CART_CLEARED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate('userId', 'fullName email').populate('items.productId');
    return sendSuccess(res, StatusCodes.SUCCESS_OK, carts);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.getCartByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!isValidId(userId)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    if (!cart) return sendSuccess(res, StatusCodes.SUCCESS_OK, { items: [] }, Messages.CART_EMPTY);
    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.clearCartByUserId = async (req, res) => {
  const { userId } = req.params;
  if (!isValidId(userId)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CART_NOT_FOUND);
    cart.items = [];
    await cart.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.CART_CLEARED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};
