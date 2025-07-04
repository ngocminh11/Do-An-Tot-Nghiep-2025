const Promotion = require('../Models/Promotions');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');

function determineStatus(promo) {
  const now = new Date();
  if (promo.status === 'disabled') return 'disabled';
  if (now < promo.startDate) return 'scheduled';
  if (now > promo.endDate) return 'expired';
  return 'active';
}

// Create promotion
exports.createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    promotion.status = determineStatus(promotion);
    const saved = await promotion.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, saved, Messages.PROMOTION_CREATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, err.message);
  }
};

// Get all promotions with filter
exports.getAllPromotions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      name,
      promoCode,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (name) query.name = new RegExp(name, 'i');
    if (promoCode) query.promoCode = new RegExp(promoCode, 'i');
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const sortField = ['createdAt', 'updatedAt', 'startDate', 'endDate'].includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const promotions = await Promotion.find(query)
      .sort({ [sortField]: sortDirection })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('applicableProducts', 'name')
      .populate('applicableCategories', 'name');

    const total = await Promotion.countDocuments(query);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit),
      data: promotions
    }, Messages.PROMOTION_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Get promotion by ID
exports.getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const promo = await Promotion.findById(id)
      .populate('applicableProducts', 'name')
      .populate('applicableCategories', 'name');

    if (!promo) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PROMOTION_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, promo, Messages.PROMOTION_FETCH_SUCCESS);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Update promotion
exports.updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const updates = { ...req.body };
    delete updates._id;

    updates.status = determineStatus(updates);

    const updated = await Promotion.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PROMOTION_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, Messages.PROMOTION_UPDATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, err.message);
  }
};

// Delete promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    const deleted = await Promotion.findByIdAndDelete(id);
    if (!deleted) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PROMOTION_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.PROMOTION_DELETED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Toggle promotion status
exports.togglePromotionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }

    if (!['active', 'inactive'].includes(status)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Trạng thái không hợp lệ');
    }

    const updated = await Promotion.findByIdAndUpdate(id, { status }, {
      new: true,
      runValidators: true
    });

    if (!updated) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PROMOTION_NOT_FOUND);
    }

    return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, 'Cập nhật trạng thái thành công');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Get promotion statistics
exports.getPromotionStats = async (req, res) => {
  try {
    const totalPromotions = await Promotion.countDocuments();
    const activePromotions = await Promotion.countDocuments({ status: 'active' });
    const inactivePromotions = await Promotion.countDocuments({ status: 'inactive' });
    const expiredPromotions = await Promotion.countDocuments({ status: 'expired' });
    const scheduledPromotions = await Promotion.countDocuments({ status: 'scheduled' });

    const stats = {
      total: totalPromotions,
      active: activePromotions,
      inactive: inactivePromotions,
      expired: expiredPromotions,
      scheduled: scheduledPromotions
    };

    return sendSuccess(res, StatusCodes.SUCCESS_OK, stats, 'Thống kê khuyến mãi thành công');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};

// Export promotions to Excel
exports.exportPromotions = async (req, res) => {
  try {
    const { status, search } = req.query;
    const query = {};

    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: new RegExp(search, 'i') },
        { code: new RegExp(search, 'i') }
      ];
    }

    const promotions = await Promotion.find(query)
      .populate('applicableProducts', 'name')
      .populate('applicableCategories', 'name')
      .sort({ createdAt: -1 });

    // Convert to CSV format
    const csvData = promotions.map(promo => ({
      'Mã khuyến mãi': promo.code,
      'Tên khuyến mãi': promo.name,
      'Loại giảm giá': promo.discountType === 'percentage' ? 'Phần trăm' : 'Số tiền cố định',
      'Giá trị giảm': promo.discountValue,
      'Trạng thái': promo.status === 'active' ? 'Hoạt động' : 'Không hoạt động',
      'Ngày bắt đầu': promo.startDate ? new Date(promo.startDate).toLocaleDateString('vi-VN') : '',
      'Ngày kết thúc': promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : '',
      'Ngày tạo': new Date(promo.createdAt).toLocaleDateString('vi-VN')
    }));

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=promotions_${new Date().toISOString().split('T')[0]}.csv`);

    // Convert to CSV string
    const csvString = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).map(value => `"${value}"`).join(','))
    ].join('\n');

    res.send(csvString);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};
