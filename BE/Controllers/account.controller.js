const User = require('../Models/Accounts');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

// Lấy tất cả user có lọc, phân trang, tìm kiếm
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      id,
      fullName,
      email,
      phone,
      role,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
      }
      query._id = id;
    }

    if (fullName) query.fullName = new RegExp(fullName, 'i');
    if (email) query.email = new RegExp(email, 'i');
    if (phone) query.phone = new RegExp(phone, 'i');
    if (role) query.role = role;

    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const users = await User.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: users,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      perPage: parseInt(limit)
    }, Messages.USER_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Lấy chi tiết user theo _id
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const user = await User.findById(id);
    if (!user) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.USER_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, user, Messages.USER_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Tạo mới user
exports.createUser = async (req, res) => {
  try {
    const user = new User(req.body);
    const savedUser = await user.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, savedUser, Messages.USER_CREATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

// Cập nhật user theo _id
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const updates = { ...req.body };
    if (updates._id) delete updates._id;

    const updatedUser = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.USER_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updatedUser, Messages.USER_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Xóa user theo _id
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.USER_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.USER_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

