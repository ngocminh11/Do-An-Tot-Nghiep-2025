const Cart = require('../Models/Carts');
const Product = require('../Models/Products');
const ProductDetail = require('../Models/ProductDetail');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// controllers/cart.controller.js
exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity = 1 } = req.body;

  if (!isValidId(productId))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const product = await Product.findById(productId);
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    const detail = await ProductDetail.findById(product.detailId);
    if (!detail)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy chi tiết sản phẩm');

    const stockLeft = detail.pricingAndInventory?.stockQuantity ?? 0;

    let cart = await Cart.findOne({ userId });
    if (!cart) cart = new Cart({ userId, items: [] });

    const idx = cart.items.findIndex(i => i.productId.equals(productId));
    const currentQtyInCart = idx !== -1 ? cart.items[idx].quantity : 0;
    const newTotalQty = currentQtyInCart + quantity;

    if (newTotalQty > stockLeft) {
      return sendError(
        res,
        StatusCodes.ERROR_BAD_REQUEST,
        `Chỉ còn ${stockLeft - currentQtyInCart} sản phẩm trong kho.`
      );
    }

    if (idx !== -1) {
      cart.items[idx].quantity = newTotalQty;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    const io = req.app.get('io');
    io && io.emit('cart-updated', { userId });
    await cart.populate({ path: 'items.productId', populate: { path: 'detailId' } });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart, Messages.CART_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// controllers/cart.controller.js  (hàm updateQuantity)
exports.updateQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  if (!isValidId(productId) || !Number.isInteger(quantity) || quantity < 1) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_INPUT);
  }

  try {
    const product = await Product.findById(productId);
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    const detail = await ProductDetail.findById(product.detailId);
    if (!detail)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy chi tiết sản phẩm');

    const stockLeft = detail.pricingAndInventory?.stockQuantity ?? 0;

    const cart = await Cart.findOne({ userId });
    if (!cart)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CART_NOT_FOUND);

    const item = cart.items.find(i => i.productId.equals(productId));
    if (!item)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_IN_CART);

    if (quantity > stockLeft) {
      return sendError(
        res,
        StatusCodes.ERROR_BAD_REQUEST,
        `Chỉ còn ${stockLeft} sản phẩm trong kho.`
      );
    }

    item.quantity = quantity;
    await cart.save();
    const io = req.app.get('io');
    io && io.emit('cart-updated', { userId });
    await cart.populate({ path: 'items.productId', populate: { path: 'detailId' } });
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
    const io = req.app.get('io');
    io && io.emit('cart-updated', { userId });
    await cart.populate({ path: 'items.productId', populate: { path: 'detailId' } });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart, Messages.CART_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.getMyCart = async (req, res) => {
  const userId = req.user._id;
  try {
    const cart = await Cart.findOne({ userId })
      .populate({
        path: 'items.productId',
        populate: { path: 'detailId' }
      });
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
    const io = req.app.get('io');
    io && io.emit('cart-updated', { userId });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.CART_CLEARED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.find()
      .populate('userId', 'fullName email')
      .populate({ path: 'items.productId', populate: { path: 'detailId' } });
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
    // Emit realtime event
    const io = req.app.get('io');
    io && io.emit('cart-updated', { userId });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.CART_CLEARED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};
