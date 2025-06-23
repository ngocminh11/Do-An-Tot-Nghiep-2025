const Category = require('../Models/Categories');
const Product = require('../Models/Products');
const slugify = require('slugify');
const mongoose = require('mongoose');

const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildRegexSearch = (value) =>
  new RegExp(`${value}`, 'i');

exports.getAllCategories = async (req, res) => {
  try {
    const { name, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (name) query.name = buildRegexSearch(name);
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const [categories, totalItems] = await Promise.all([
      Category.find(query)
        .sort({ updatedAt: -1, createdAt: -1 }) // Sort newest update first
        .skip(Number(skip))
        .limit(Number(limit)),
      Category.countDocuments(query),
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: categories,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      perPage: Number(limit)
    }, Messages.CATEGORY_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.getCategoryById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const category = await Category.findById(id);
    if (!category)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CATEGORY_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, category, Messages.CATEGORY_FETCH_SUCCESS);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};


exports.createCategory = async (req, res) => {
  try {
    console.log('Request body:', req.body);

    const { name, description, status } = req.body;

    if (!name) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_NAME_REQUIRED);

    const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });

    const [nameExists, slugExists] = await Promise.all([
      Category.findOne({ name: name.trim() }),
      Category.findOne({ slug })
    ]);

    if (nameExists) {
      console.log('Name already exists:', name);
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_NAME_EXISTS);
    }
    if (slugExists) {
      console.log('Slug already exists:', slug);
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_SLUG_EXISTS);
    }

    // Tạo danh mục mới
    const newCategory = new Category({
      name: name.trim(),
      slug,
      description: description ? description.trim() : '',
      status: status || 'active'
    });

    console.log('New category object:', newCategory);

    const saved = await newCategory.save();
    console.log('Saved category:', saved);

    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, saved, Messages.CATEGORY_CREATED);
  } catch (error) {
    console.error('Error in createCategory:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Object.values(error.errors).map(err => err.message).join(', '));
    }
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ID:', id);
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    // Tìm danh mục cần cập nhật
    const category = await Category.findById(id);
    if (!category) {
      console.log('Category not found:', id);
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CATEGORY_NOT_FOUND);
    }

    // Validate và xử lý tên mới nếu có
    if (name) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        console.log('Invalid name:', name);
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_NAME_REQUIRED);
      }

      const trimmedName = name.trim();
      if (trimmedName !== category.name) {
        // Kiểm tra trùng tên
        const nameExists = await Category.findOne({
          name: trimmedName,
          _id: { $ne: id }
        });

        if (nameExists) {
          console.log('Name already exists:', trimmedName);
          return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_NAME_EXISTS);
        }

        // Cập nhật tên và slug
        category.name = trimmedName;
        category.slug = slugify(trimmedName, { lower: true, strict: true, locale: 'vi' });
        console.log('Updated name and slug:', { name: category.name, slug: category.slug });
      }
    }

    // Cập nhật mô tả nếu có
    if (description !== undefined) {
      category.description = description ? description.trim() : '';
    }

    // Cập nhật trạng thái nếu có
    if (status !== undefined) {
      if (!['active', 'inactive', 'archived'].includes(status)) {
        console.log('Invalid status:', status);
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Trạng thái không hợp lệ');
      }
      category.status = status;
    }

    // Lưu thay đổi
    console.log('Saving category updates:', category);
    const updated = await category.save();
    console.log('Category updated successfully:', updated);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, Messages.CATEGORY_UPDATED);
  } catch (error) {
    console.error('Error in updateCategory:', error);
    if (error.name === 'ValidationError') {
      console.error('Validation errors:', error.errors);
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Object.values(error.errors).map(err => err.message).join(', '));
    }
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const affectedProducts = await Product.find({ 'basicInformation.categoryIds': id });
    for (const product of affectedProducts) {
      product.basicInformation.categoryIds = product.basicInformation.categoryIds.filter(
        catId => catId.toString() !== id
      );
      if (product.basicInformation.categoryIds.length === 0) {
        product.basicInformation.status = 'inactive';
      }
      await product.save();
    }

    const deleted = await Category.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CATEGORY_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.CATEGORY_DELETED);
  } catch (error) {
    console.error('Error in deleteCategory:', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
