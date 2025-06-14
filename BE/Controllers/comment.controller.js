const mongoose = require('mongoose');
const Comment = require('../Models/Comments');
const User = require('../Models/Accounts');
const Product = require('../Models/Products');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

// Lấy tất cả bình luận (lọc, tìm kiếm, phân trang)
exports.getAllComments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      productId,
      rating,
      content,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      query.userId = userId;
    }
    if (productId && mongoose.Types.ObjectId.isValid(productId)) {
      query.productId = productId;
    }
    if (rating) {
      query.rating = Number(rating);
    }
    if (content) {
      query.content = new RegExp(content, 'i');
    }
    if (status) {
      query.status = status;
    }

    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDir = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const comments = await Comment.find(query)
      .sort({ [sortField]: sortDir })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'fullName email')
      .populate('productId', 'basicInformation.productName')

    const total = await Comment.countDocuments(query);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: comments,
      total,
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / limit),
      perPage: parseInt(limit)
    }, Messages.COMMENT_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

// Lấy bình luận theo ID
exports.getCommentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const comment = await Comment.findById(id)
      .populate('userId', 'fullName email')
      .populate('productId', 'basicInformation.name');

    if (!comment) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.COMMENT_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, comment, Messages.COMMENT_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

// Xóa bình luận
exports.deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const deleted = await Comment.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.COMMENT_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.COMMENT_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

// Trả lời bình luận (Admin)
exports.replyToComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { replyContent } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    if (!replyContent || typeof replyContent !== 'string' || replyContent.trim().length < 3) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Nội dung phản hồi không hợp lệ.');
    }

    const comment = await Comment.findById(id);
    if (!comment) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.COMMENT_NOT_FOUND);
    }

    comment.reply = {
      content: replyContent.trim(),
      repliedAt: new Date()
    };

    const updated = await comment.save();

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, 'Phản hồi bình luận thành công');
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

