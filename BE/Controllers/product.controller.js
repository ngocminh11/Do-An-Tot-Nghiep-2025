const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const slugify = require('slugify');
const mongoose = require('mongoose');
const fs = require('fs').promises;

const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

/** ========== COMMON UTILITIES ========== **/
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const buildRegexSearch = (value) =>
  new RegExp(`^${value}`, 'i');

const deleteFilesIfExist = async (files) => {
  if (!files?.length) return;
  await Promise.all(
    files.map(file =>
      fs.unlink(file.path).catch(err =>
        console.error(`Error deleting file ${file.path}:`, err)
      )
    )
  );
};

exports.getAllProducts = async (req, res) => {
  try {
    const { name, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (name) query['basicInformation.name'] = buildRegexSearch(name);
    if (status) query['basicInformation.status'] = status;

    const skip = (page - 1) * limit;
    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .sort({ updatedAt: -1, createdAt: -1 }) // Sort by updatedAt, then createdAt
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('basicInformation.categoryIds', 'name'),
      Product.countDocuments(query),
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: products,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      perPage: Number(limit),
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const product = await Product.findById(id).populate('basicInformation.categoryIds', 'name');
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, product);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

exports.getProductById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const product = await Product.findById(id).populate('basicInformation.categoryIds', 'name');
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, product);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};


// GET /products/:id
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const product = await Product.findById(id)
      .populate('basicInformation.categoryIds', 'name');
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, product);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

// POST /products
exports.createProduct = async (req, res) => {
  try {
    const {
      name, sku, urlSlug, shortDescription, fullDescription,
      brand, origin, ingredients, status, categoryIds,
      price, originalPrice, stockQuantity
    } = req.body;

    if (!name)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_REQUIRED);

    const [nameExists, skuExists, slugExists] = await Promise.all([
      Product.findOne({ 'basicInformation.name': name }),
      Product.findOne({ 'basicInformation.sku': sku }),
      Product.findOne({ 'basicInformation.urlSlug': urlSlug }),
    ]);

    if (nameExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
    if (skuExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);
    if (slugExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.URLSLUG_EXISTS);

    const product = new Product({
      basicInformation: {
        name,
        sku,
        urlSlug: slugify(urlSlug, { lower: true, strict: true, locale: 'vi' }),
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

// PUT /products/:id
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const product = await Product.findById(id);
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    const {
      name, sku, urlSlug, categoryIds,
      basicInformation = {}, pricing = {}
    } = req.body;

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

    Object.assign(product.basicInformation, basicInformation);
    Object.assign(product.pricing, pricing);

    const updated = await product.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, Messages.PRODUCT_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

// DELETE /products/:id
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const deleted = await Product.findByIdAndDelete(id);
    if (!deleted)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.PRODUCT_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};
