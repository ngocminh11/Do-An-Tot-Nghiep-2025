const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const slugify = require('slugify');
const fs = require('fs').promises;
const mongoose = require('mongoose');

const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

const handleUploadError = (error, res) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File vượt quá kích thước cho phép (30MB)' });
  }
  return res.status(400).json({ message: error.message });
};

const deleteOldFiles = async (files) => {
  if (!files) return;
  await Promise.all(files.map(file =>
    fs.unlink(file.path).catch(err =>
      console.error(`Error deleting file ${file.path}:`, err)
    )
  ));
};

exports.getAllProducts = async (req, res) => {
  try {
    const { name, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (name) {
      query['basicInformation.name'] = {
        $regex: new RegExp(`^${name}`, 'i')
      };
    }
    if (status) query['basicInformation.status'] = status;

    const skip = (page - 1) * limit;

    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('basicInformation.categoryIds'),
      Product.countDocuments(query),
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: products,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      perPage: Number(limit),
    });
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const product = await Product.findById(id).populate('basicInformation.categoryIds');
    if (!product) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, product);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      urlSlug,
      shortDescription,
      fullDescription,
      brand,
      origin,
      ingredients,
      status,
      categoryIds,
      price,
      originalPrice,
      stockQuantity,
    } = req.body;

    if (!name) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_REQUIRED);
    }

    const [nameExists, skuExists, slugExists] = await Promise.all([
      Product.findOne({ 'basicInformation.name': name }),
      Product.findOne({ 'basicInformation.sku': sku }),
      Product.findOne({ 'basicInformation.urlSlug': urlSlug }),
    ]);

    if (nameExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
    if (skuExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);
    if (slugExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.URLSLUG_EXISTS);

    const slug = slugify(urlSlug, { lower: true, strict: true, locale: 'vi' });

    const product = new Product({
      basicInformation: {
        name,
        sku,
        urlSlug: slug,
        shortDescription,
        fullDescription,
        brand,
        origin,
        ingredients,
        status,
        categoryIds,
      },
      pricing: {
        price,
        originalPrice,
        stockQuantity,
      },
    });

    const saved = await product.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, { product: saved }, Messages.PRODUCT_CREATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    }

    const { name, sku, urlSlug, categoryIds, ...rest } = req.body;

    const [nameExists, skuExists, slugExists] = await Promise.all([
      name ? Product.findOne({ 'basicInformation.name': name, _id: { $ne: id } }) : null,
      sku ? Product.findOne({ 'basicInformation.sku': sku, _id: { $ne: id } }) : null,
      urlSlug ? Product.findOne({ 'basicInformation.urlSlug': urlSlug, _id: { $ne: id } }) : null,
    ]);

    if (nameExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
    if (skuExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);
    if (slugExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.URLSLUG_EXISTS);

    if (name) product.basicInformation.name = name;
    if (sku) product.basicInformation.sku = sku;
    if (urlSlug) product.basicInformation.urlSlug = slugify(urlSlug, { lower: true, strict: true, locale: 'vi' });
    if (categoryIds) product.basicInformation.categoryIds = categoryIds;

    Object.assign(product.basicInformation, rest.basicInformation || {});
    Object.assign(product.pricing, rest.pricing || {});

    const updated = await product.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, Messages.PRODUCT_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.PRODUCT_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};
