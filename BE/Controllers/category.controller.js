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
      perPage: Number(limit),
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
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

    return sendSuccess(res, StatusCodes.SUCCESS_OK, category);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// Lấy danh mục kèm theo danh sách sản phẩm
exports.getCategoryWithProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    if (!isValidId(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    // Lấy thông tin danh mục
    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CATEGORY_NOT_FOUND);
    }

    // Xây dựng query cho sản phẩm
    const query = {
      'basicInformation.categoryIds': id
    };

    // Thêm filter status nếu có
    if (status) {
      query['basicInformation.status'] = status;
    }

    const skip = (page - 1) * limit;
    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .populate('basicInformation.categoryIds', 'name')
        .sort({ updatedAt: -1, createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Product.countDocuments(query),
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      category: {
        id: category._id,
        name: category.name,
        description: category.description,
        status: category.status,
        slug: category.slug
      },
      products: {
        data: products,
        currentPage: Number(page),
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
        perPage: Number(limit)
      }
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { name, description, status } = req.body;
    if (!name) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_NAME_REQUIRED);

    const slug = slugify(name, { lower: true, strict: true, locale: 'vi' });

    const [nameExists, slugExists] = await Promise.all([
      Category.findOne({ name }),
      Category.findOne({ slug })
    ]);

    if (nameExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_NAME_EXISTS);
    if (slugExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_SLUG_EXISTS);

    const newCategory = new Category({ name, slug, description, status });
    const saved = await newCategory.save();

    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, saved, Messages.CATEGORY_CREATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const category = await Category.findById(id);
    if (!category) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CATEGORY_NOT_FOUND);
    }

    const [nameConflict, slugConflict] = await Promise.all([
      name ? Category.findOne({ name, _id: { $ne: id } }) : null,
      slug ? Category.findOne({ slug, _id: { $ne: id } }) : null
    ]);

    if (nameConflict) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_NAME_EXISTS);
    if (slugConflict) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.CATEGORY_SLUG_EXISTS);

    category.name = name || category.name;
    category.slug = slug ? slugify(slug, { lower: true, strict: true, locale: 'vi' }) : category.slug;
    category.description = description ?? category.description;
    category.status = status ?? category.status;
    category.updatedAt = new Date();

    const updated = await category.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, Messages.CATEGORY_UPDATED);
  } catch (error) {
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
    if (!deleted) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CATEGORY_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.CATEGORY_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
