// controllers/order.controller.js

const mongoose = require('mongoose');
const Order = require('../Models/Orders');
const Product = require('../Models/Products');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

const getEffectivePrice = (product) => {
  return product.pricingAndInventory.salePrice ?? product.pricingAndInventory.originalPrice;
};

// ================= USER ================= //

exports.createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, notes, promotionCode } = req.body;
    const userId = req.user._id;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Đơn hàng không có sản phẩm');
    }

    const enrichedItems = await Promise.all(items.map(async (item) => {
      const product = await Product.findById(item.product);
      if (!product) throw new Error('Sản phẩm không tồn tại');

      const stock = product.pricingAndInventory.stockQuantity;
      if (item.quantity > stock) throw new Error(`Sản phẩm "${product.basicInformation.name}" không đủ hàng`);

      const price = getEffectivePrice(product);

      return {
        product: product._id,
        productName: product.basicInformation.name,
        unit: product.pricingAndInventory.unit,
        currency: product.pricingAndInventory.currency,
        quantity: item.quantity,
        price,
        discount: item.discount || 0
      };
    }));

    const totalAmount = enrichedItems.reduce((sum, item) => {
      const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + discountedPrice * item.quantity;
    }, 0);

    const newOrder = new Order({
      user: userId,
      items: enrichedItems,
      totalAmount,
      paymentMethod,
      notes,
      promotionCode,
      statusHistory: [{ status: 'Chờ xác nhận' }],
    });

    const savedOrder = await newOrder.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, savedOrder, Messages.ORDER_CREATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, orders, Messages.ORDER_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id).populate('user', 'fullName email');
    if (!order) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return sendError(res, StatusCodes.ERROR_FORBIDDEN, Messages.FORBIDDEN);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, Messages.ORDER_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.cancelRequestByUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id);
    if (!order) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    if (order.user.toString() !== req.user._id.toString()) return sendError(res, StatusCodes.ERROR_FORBIDDEN, Messages.FORBIDDEN);

    const isPaid = order.paymentStatus === 'Đã thanh toán';
    const within3Hours = (new Date() - new Date(order.createdAt)) / (1000 * 60 * 60) <= 3;

    if (isPaid || !within3Hours || order.status !== 'Chờ xác nhận') {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Không thể gửi yêu cầu hủy đơn hàng');
    }

    order.isCancelRequested = true;
    order.cancelRequestTime = new Date();
    await order.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, Messages.ORDER_CANCEL_REQUEST_SENT);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// ================= ADMIN ================= //

exports.getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, idUser, status, paymentStatus, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (idUser && mongoose.Types.ObjectId.isValid(idUser)) query.user = idUser;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const orders = await Order.find(query)
      .populate('user', 'fullName email')
      .sort(sort)
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Order.countDocuments(query);
    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit),
      data: orders
    }, Messages.ORDER_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id);
    if (!order) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    if (order.status === status) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Trạng thái không thay đổi');

    order.status = status;
    order.statusHistory.push({ status });
    await order.save();

    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, Messages.ORDER_STATUS_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.respondCancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { accept, reason } = req.body;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const order = await Order.findById(id);
    if (!order || !order.isCancelRequested) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Không có yêu cầu hủy đơn');

    if (accept) {
      order.status = 'Hủy';
      order.statusHistory.push({ status: 'Hủy' });
      order.cancellationReason = reason || 'Người bán chấp nhận hủy đơn';
    } else {
      order.isCancelRequested = false;
      order.cancelRequestTime = null;
    }
    await order.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, accept ? Messages.ORDER_CANCELED : Messages.ORDER_CANCEL_REQUEST_DECLINED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const updates = { ...req.body };
    delete updates._id;

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!updatedOrder) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updatedOrder, Messages.ORDER_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.ORDER_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
