const Cart = require('../Models/Carts');
const Product = require('../Models/Products');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');
const mongoose = require('mongoose');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.addToCart = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity = 1 } = req.body;

  if (!isValidId(productId))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const product = await Product.findById(productId);
    if (!product) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity }] });
    } else {
      const index = cart.items.findIndex(item => item.productId.equals(productId));
      if (index !== -1) {
        cart.items[index].quantity += quantity;
      } else {
        cart.items.push({ productId, quantity });
      }
    }
    await cart.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, cart, Messages.CART_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.updateQuantity = async (req, res) => {
  const userId = req.user._id;
  const { productId, quantity } = req.body;

  if (!isValidId(productId) || quantity < 1)
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_INPUT);

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CART_NOT_FOUND);

    const item = cart.items.find(item => item.productId.equals(productId));
    if (!item) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_IN_CART);

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
