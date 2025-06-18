const Post = require('../Models/Posts');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

// Lấy tất cả bài viết với phân trang, lọc, tìm kiếm
exports.getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      title,
      category,
      tags,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};
    if (title) query.title = { $regex: title, $options: 'i' };
    if (category) query.category = category;
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(',').map(tag => tag.trim()) };

    const sortField = ['createdAt', 'updatedAt'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;
    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(Number(skip))
      .limit(Number(limit));

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit),
      data: posts,
    }, Messages.POST_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Lấy chi tiết bài viết theo ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.POST_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, post, Messages.POST_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Tạo bài viết mới
exports.createPost = async (req, res) => {
  try {
    const newPost = new Post(req.body);
    const savedPost = await newPost.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, savedPost, Messages.POST_CREATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, err.message);
  }
};

// Cập nhật bài viết
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const updates = { ...req.body };
    delete updates._id;

    const updatedPost = await Post.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedPost) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.POST_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updatedPost, Messages.POST_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Xóa bài viết
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const deletedPost = await Post.findByIdAndDelete(id);
    if (!deletedPost) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.POST_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.POST_DELETED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
