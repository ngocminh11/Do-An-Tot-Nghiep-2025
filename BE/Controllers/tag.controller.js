const Tag = require('../Models/Tags');
const Product = require('../Models/Products');
const mongoose = require('mongoose');

const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

exports.getAllTags = async (req, res) => {
  try {
    const { name, page = 1, limit = 10 } = req.query;
    const query = {};

    if (name) {
      query.name = { $regex: new RegExp(`^${name}`, 'i') };
    }

    const skip = (page - 1) * limit;

    const [tags, totalItems] = await Promise.all([
      Tag.find(query)
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit)),
      Tag.countDocuments(query),
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: tags,
      currentPage: Number(page),
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
      perPage: Number(limit),
    });
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

exports.getTagById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const tag = await Tag.findById(id).populate('productIds');
    if (!tag) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.TAG_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, tag);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name, description, productIds = [] } = req.body;

    if (!name) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.TAG_NAME_REQUIRED);
    }

    const nameExists = await Tag.findOne({ name });
    if (nameExists) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.TAG_NAME_EXISTS);
    }

    const validProducts = await Product.find({ _id: { $in: productIds } });
    if (productIds.length > 0 && validProducts.length !== productIds.length) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_PRODUCT_REFERENCES);
    }

    const tag = new Tag({
      name,
      description,
      productIds
    });

    const saved = await tag.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, saved, Messages.TAG_CREATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};

exports.updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, productIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const tag = await Tag.findById(id);
    if (!tag) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.TAG_NOT_FOUND);
    }

    if (name && name !== tag.name) {
      const exists = await Tag.findOne({ name, _id: { $ne: id } });
      if (exists) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.TAG_NAME_EXISTS);
      }
      tag.name = name;
    }

    if (description !== undefined) tag.description = description;

    if (productIds) {
      const validProducts = await Product.find({ _id: { $in: productIds } });
      if (validProducts.length !== productIds.length) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_PRODUCT_REFERENCES);
      }
      tag.productIds = productIds;
    }

    const updated = await tag.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, Messages.TAG_UPDATED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, error.message);
  }
};


exports.deleteTag = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const deleted = await Tag.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.TAG_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.TAG_DELETED);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};
