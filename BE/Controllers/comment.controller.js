const mongoose = require('mongoose');
const Comment = require('../Models/Comments');
const User = require('../Models/Accounts');
const Product = require('../Models/Products');

const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

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
      sortBy = 'updatedAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    if (userId && isValidObjectId(userId)) query.userId = userId;
    if (productId && isValidObjectId(productId)) query.productId = productId;
    if (rating) query.rating = Number(rating);
    if (content) query.content = new RegExp(content, 'i');
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'updatedAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [comments, totalItems] = await Promise.all([
      Comment.find(query)
        .sort({ [sortField]: sortDirection, createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .populate('userId', 'fullName email')
        .populate('productId', 'basicInformation.name'),

      Comment.countDocuments(query),
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: comments,
      totalItems,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      perPage: Number(limit),
    }, Messages.COMMENT_FETCH_SUCCESS);
  } catch (error) {
    console.error('[GetAllComments]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.getCommentById = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  }

  try {
    const comment = await Comment.findById(id)
      .populate('userId', 'fullName email')
      .populate('productId', 'basicInformation.name');

    if (!comment) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.COMMENT_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, comment, Messages.COMMENT_FETCH_SUCCESS);
  } catch (error) {
    console.error('[GetCommentById]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.createComment = async (req, res) => {
  try {
    const { userId, productId, rating, content } = req.body;

    if (!userId || !productId || !content || rating == null)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Thiếu thông tin bắt buộc.');

    if (!isValidObjectId(userId) || !isValidObjectId(productId))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    if (typeof rating !== 'number' || rating < 1 || rating > 5)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Đánh giá phải từ 1 đến 5.');

    if (typeof content !== 'string' || content.trim().length < 3)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Nội dung bình luận quá ngắn.');

    const [product, user] = await Promise.all([
      Product.findById(productId),
      User.findById(userId),
    ]);

    if (!product || !user)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy người dùng hoặc sản phẩm.');

    const existed = await Comment.findOne({ userId, productId });
    if (existed)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Bạn đã bình luận sản phẩm này rồi.');

    const comment = new Comment({
      userId,
      productId,
      rating,
      content: content.trim(),
      status: 'pending', 
    });

    const saved = await comment.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, saved, 'Bình luận đã được gửi.');
  } catch (error) {
    console.error('[CreateComment]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};


exports.updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, rating, content } = req.body;

    if (!isValidObjectId(id) || !isValidObjectId(userId))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    const comment = await Comment.findById(id);
    if (!comment)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.COMMENT_NOT_FOUND);

    if (comment.userId.toString() !== userId)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Bạn không có quyền chỉnh sửa bình luận này.');

    if (rating && (typeof rating !== 'number' || rating < 1 || rating > 5))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Số sao không hợp lệ.');

    if (content && (typeof content !== 'string' || content.trim().length < 3))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Nội dung bình luận quá ngắn.');

    if (rating) comment.rating = rating;
    if (content) comment.content = content.trim();
    comment.updatedAt = new Date();

    const updated = await comment.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, 'Cập nhật bình luận thành công.');
  } catch (error) {
    console.error('[UpdateComment]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.deleteComment = async (req, res) => {
  const { id } = req.params;
  if (!isValidObjectId(id)) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  }

  try {
    const deleted = await Comment.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.COMMENT_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.COMMENT_DELETED);
  } catch (error) {
    console.error('[DeleteComment]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * PUT /comments/:id/reply
 * Phản hồi bình luận (chỉ admin dùng)
 */
exports.replyToComment = async (req, res) => {
  const { id } = req.params;
  const { replyContent } = req.body;

  if (!isValidObjectId(id)) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  }

  if (!replyContent || typeof replyContent !== 'string' || replyContent.trim().length < 3) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Nội dung phản hồi không hợp lệ.');
  }

  try {
    const comment = await Comment.findById(id);
    if (!comment) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.COMMENT_NOT_FOUND);
    }

    comment.reply = {
      content: replyContent.trim(),
      repliedAt: new Date(),
    };

    const updated = await comment.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, 'Phản hồi bình luận thành công');
  } catch (error) {
    console.error('[ReplyToComment]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
