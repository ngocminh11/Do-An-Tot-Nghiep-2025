const User = require('../Models/Accounts');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

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
      accountStatus,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (id && mongoose.Types.ObjectId.isValid(id)) query._id = id;
    if (fullName) query.fullName = { $regex: fullName, $options: 'i' };
    if (email) query.email = { $regex: email, $options: 'i' };
    if (phone) query.phone = { $regex: phone, $options: 'i' };
    if (role) query.role = role;
    if (accountStatus) query.accountStatus = accountStatus;

    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const users = await User.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await User.countDocuments(query);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit),
      data: users
    }, Messages.USER_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

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

exports.createUser = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress || null;
    const userAgent = req.headers['user-agent'] || null;

    const user = new User({
      ...req.body,
      registrationIP: ip,
      userAgent: userAgent
    });

    const savedUser = await user.save();

    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, savedUser, Messages.USER_CREATED);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern?.email) {
      return sendError(res, StatusCodes.ERROR_CONFLICT, Messages.EMAIL_ALREADY_EXISTS);
    }
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const updates = { ...req.body };
    delete updates._id;

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