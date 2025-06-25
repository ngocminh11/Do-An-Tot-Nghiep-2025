const mongoose = require('mongoose');
const Order   = require('../Models/Orders');
const Product = require('../Models/Products');
const User    = require('../Models/Accounts');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');

/* Doanh thu theo tháng – 12 tháng gần nhất */
exports.revenueByMonth = async (req, res) => {
  try {
    // Lấy 12 tháng (bao gồm tháng hiện tại)
    const today = new Date();
    const from  = new Date(today.getFullYear(), today.getMonth() - 11, 1); // đầu tháng cách 11 tháng

    const rows = await Order.aggregate([
      {
        $match: {
          status: 'Hoàn thành',
          paymentStatus: 'Đã thanh toán',
          createdAt: { $gte: from }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Trả về dạng { "2025-01": 1000000, ... }
    const data = {};
    rows.forEach(r => { data[r._id] = r.revenue; });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, data, 'Doanh thu theo tháng');
  } catch (err) {
    console.error(err);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Lỗi thống kê doanh thu');
  }
};

/* ----------------------------------------------------
   2) Top sản phẩm bán chạy
   --------------------------------------------------*/
exports.topProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  try {
    const rows = await Order.aggregate([
      { $match: { status: 'Hoàn thành', paymentStatus: 'Đã thanh toán' } },
      { $unwind: '$items' },
      { $group: {
          _id: '$items.product',
          totalSold: { $sum: '$items.quantity' }
      }},
      { $sort: { totalSold: -1 } },
      { $limit: limit },
      { $lookup: { from: 'products', localField: '_id', foreignField: '_id', as: 'product' } },
      { $unwind: '$product' },
      { $project: {
          _id: 0,
          productId: '$_id',
          productName: '$product.basicInformation.productName',
          totalSold: 1
      }}
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, rows, 'Top sản phẩm bán chạy');
  } catch (err) {
    console.error(err);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Lỗi thống kê top sản phẩm');
  }
};

/* ----------------------------------------------------
   3) Sản phẩm tồn kho thấp (<= minStockAlert hoặc = 0)
   --------------------------------------------------*/
exports.lowStockProducts = async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;

  try {
    const rows = await Product.find(
      { 'pricingAndInventory.stockQuantity': { $lte: 0 } },
      {
        _id: 1,
        'basicInformation.productName': 1,
        'pricingAndInventory.stockQuantity': 1
      }
    )
    .sort({ 'pricingAndInventory.stockQuantity': 1 })
    .limit(limit);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, rows, 'Sản phẩm sắp hết hàng');
  } catch (err) {
    console.error(err);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Lỗi thống kê tồn kho');
  }
};

/* ----------------------------------------------------
   4) Tỷ lệ đơn hàng theo trạng thái
   --------------------------------------------------*/
exports.orderStatusRatio = async (req, res) => {
  try {
    const rows = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const data = {};
    rows.forEach(r => { data[r._id] = r.count; });

    return sendSuccess(res, StatusCodes.SUCCESS_OK, data, 'Tỷ lệ trạng thái đơn hàng');
  } catch (err) {
    console.error(err);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Lỗi thống kê trạng thái đơn');
  }
};

/* ----------------------------------------------------
   5) Tăng trưởng người dùng theo tháng
   --------------------------------------------------*/
exports.userGrowth = async (req, res) => {
  const months = parseInt(req.query.months) || 6;

  try {
    const today = new Date();
    const from  = new Date(today.getFullYear(), today.getMonth() - (months - 1), 1);

    const rows = await User.aggregate([
      { $match: { createdAt: { $gte: from } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt', timezone: 'Asia/Ho_Chi_Minh' } },
          newUsers: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    const data = {};
    rows.forEach(r => { data[r._id] = r.newUsers; });

    return sendSuccess(res, StatusCodes.SUCCESS_OK, data, 'Tăng trưởng người dùng');
  } catch (err) {
    console.error(err);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Lỗi thống kê người dùng');
  }
};
