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
    if (content && typeof content === 'string' && content.trim()) {
      query.content = new RegExp(content.trim(), 'i');
    }
    if (status && typeof status === 'string' && status.trim()) {
      query.status = status.trim();
    }

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
    const { userId, productId, orderId, rating, content } = req.body;

    if (!userId || !productId || !orderId || !content || rating == null)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Thiếu thông tin bắt buộc.');

    if (![userId, productId, orderId].every(isValidObjectId))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

    if (typeof rating !== 'number' || rating < 1 || rating > 5)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Đánh giá phải từ 1 đến 5.');

    if (typeof content !== 'string' || content.trim().length < 3)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Nội dung bình luận quá ngắn.');

    // Kiểm tra orderId thuộc về userId, có chứa productId, trạng thái hoàn thành
    const Order = mongoose.model('Order');
    const orderQuery = {
      _id: orderId,
      user: userId,
      'items.product': productId,
      status: { $in: ['Đã hoàn thành', 'completed', 'hoanthanh', 'done', 'thanhcong', 'success'] }
    };

    const order = await Order.findOne(orderQuery);
    if (order) {
      console.log('Order status:', order.status);
      console.log('Order user:', order.user);
      console.log('Order items:', order.items.map(item => ({ product: item.product, productName: item.productName })));
    }

    if (!order)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Bạn chỉ có thể đánh giá sản phẩm đã mua và đơn đã hoàn thành.');

    // Kiểm tra đã bình luận chưa
    const existed = await Comment.findOne({ userId, productId, orderId });
    if (existed)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Bạn đã bình luận sản phẩm này trong đơn hàng này rồi.');

    const comment = new Comment({
      userId,
      productId,
      orderId,
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

// Lấy đánh giá theo sản phẩm
exports.getCommentsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    if (!isValidObjectId(productId)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const query = {
      productId: productId, // Chỉ lấy comment của sản phẩm này
      status: { $in: ['visible', 'pending'] }, // Chỉ lấy comment visible hoặc pending
      userId: { $exists: true, $ne: null } // Chỉ lấy comment có userId hợp lệ
    };

    if (rating) query.rating = Number(rating);

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortField = ['createdAt', 'updatedAt', 'rating'].includes(sortBy) ? sortBy : 'createdAt';
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
      productId: productId
    }, Messages.COMMENT_FETCH_SUCCESS);
  } catch (error) {
    console.error('[GetCommentsByProduct]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

/**
 * GET /admin/comments/stats
 * Thống kê bình luận (admin)
 */
exports.getCommentStats = async (req, res) => {
  try {
    const totalComments = await Comment.countDocuments();
    const pendingComments = await Comment.countDocuments({ status: 'pending' });
    const visibleComments = await Comment.countDocuments({ status: 'visible' });
    const hiddenComments = await Comment.countDocuments({ status: 'hidden' });
    const repliedComments = await Comment.countDocuments({ 'reply.content': { $exists: true, $ne: null } });

    // Thống kê theo rating
    const ratingStats = await Comment.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const ratingData = {};
    ratingStats.forEach(item => {
      ratingData[`${item._id}star`] = item.count;
    });

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      totalComments,
      pendingComments,
      visibleComments,
      hiddenComments,
      repliedComments,
      ratingStats: ratingData
    }, 'Thống kê bình luận');
  } catch (error) {
    console.error('[GetCommentStats]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
