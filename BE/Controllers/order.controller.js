const Order = require('../Models/Orders');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

// Lấy tất cả đơn hàng với phân trang và lọc
exports.getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      idUser,
      status,
      paymentStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};
    if (idUser && mongoose.Types.ObjectId.isValid(idUser)) query.user = idUser;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('user', 'fullName email') // Populate tên và email người dùng
      .populate('items.product', 'name price')
      .sort({ [sortField]: sortDirection })
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

// Lấy đơn hàng theo ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const order = await Order.findById(id)
      .populate('user', 'fullName email')
      .populate('items.product', 'name price');
    if (!order) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, order, Messages.ORDER_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Tạo mới đơn hàng
exports.createOrder = async (req, res) => {
  try {
    const order = new Order(req.body);
    const savedOrder = await order.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, savedOrder, Messages.ORDER_CREATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

// Cập nhật đơn hàng
exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const updates = { ...req.body };
    delete updates._id;

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedOrder) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updatedOrder, Messages.ORDER_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Xóa đơn hàng
exports.deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const deletedOrder = await Order.findByIdAndDelete(id);
    if (!deletedOrder) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.ORDER_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.ORDER_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
