const mongoose   = require('mongoose');
const slugify    = require('slugify');
const ExcelJS    = require('exceljs');

const Product       = require('../Models/Products');
const ProductDetail = require('../Models/ProductDetail');
const Category      = require('../Models/Categories');
const ProductLog    = require('../Models/ProductLog');

const checkPin      = require('../Utils/checkPin');          // 🔐
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages    = require('../Constants/ResponseMessage');
require('dotenv').config();

/* -------------------- CONST & HELPER ------------------------------------- */
const ALLOWED_STATUS = ['Hiển Thị', 'Ẩn', 'Ngừng Bán'];
const STATUS_FLOW = {
  'Hiển Thị':  ['Ẩn', 'Ngừng Bán'],
  'Ẩn':        ['Hiển Thị', 'Ngừng Bán'],
  'Ngừng Bán': []
};

const isValidId = id => mongoose.Types.ObjectId.isValid(id);
const regex     = txt => new RegExp(`^${txt}`, 'i');
const fmtDate   = d   => new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const parseJSON = (body, field) => {
  try { return JSON.parse(body[field] || '{}'); }
  catch (e) { throw new Error(`JSON không hợp lệ ở "${field}": ${e.message}`); }
};
const buildFilter = ({ name, status, categoryId }) => {
  const f = {};
  if (name)       f['basicInformation.productName'] = regex(name);
  if (status)     f['basicInformation.status']      = status;
  if (categoryId) f['basicInformation.categoryIds'] = categoryId;
  return f;
};
const logAction = (productId, action, operatorId, payload = {}) =>
  ProductLog.create({ productId, action, operatorId, payload });

/* ======================================================================== */
/* 1. GET /products                                                         */
/* ======================================================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = buildFilter(req.query);

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ createdAt: -1, updatedAt: -1 })
        .skip(Number(skip)).limit(Number(limit))
        .populate('basicInformation.categoryIds', 'name')
        .lean(),
      Product.countDocuments(filter)
    ]);

    const ids     = products.map(p => p._id);
    const details = await ProductDetail.find({ _id: { $in: ids } }, 'pricingAndInventory').lean();
    const map     = Object.fromEntries(details.map(d => [d._id.toString(), d.pricingAndInventory]));
    const merged  = products.map(p => ({ ...p, pricingAndInventory: map[p._id.toString()] || {} }));

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: merged,
      currentPage: +page,
      totalPages : Math.ceil(total / limit),
      totalItems : total,
      perPage    : +limit
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};
/* ======================================================================== */
/* 2. GET /products/:id                                                     */
/* ======================================================================== */
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  try {
    const product = await Product.findById(id)
      .populate('basicInformation.categoryIds', 'name').lean();
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    const detail = await ProductDetail.findById(id).lean();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { ...product, ...detail });
  } catch (e) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, e.message);
  }
};

/* ======================================================================== */
/* 3. POST /products  – Tạo sản phẩm (🔐CHECK PIN)                          */
/* ======================================================================== */
exports.createProduct = async (req, res) => {
  try {
    await checkPin(req);         // 🔐
    delete req.body.pin;         // tránh parseJSON lẫn
    /* --- phần còn lại giữ nguyên như bản trước --- */
    const bi   = parseJSON(req.body, 'basicInformation');
    const piv  = parseJSON(req.body, 'pricingAndInventory');
    const desc = parseJSON(req.body, 'description');
    const tech = parseJSON(req.body, 'technicalDetails');
    const seo  = parseJSON(req.body, 'seo');
    const pol  = parseJSON(req.body, 'policy');

    /* ........ giữ nguyên toàn bộ logic validation & save .......... */
    /* ........ cuối hàm không đổi ........ */
  } catch (err) {
    const code = err.message.includes('PIN') ? StatusCodes.ERROR_UNAUTHORIZED
                                             : StatusCodes.ERROR_BAD_REQUEST;
    return sendError(res, code, err.message);
  }
};

/* ======================================================================== */
/* 4. PUT /products/:id – Cập nhật mô tả chung (🔐)                         */
/* ======================================================================== */
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    await checkPin(req);                 // 🔐
    delete req.body.pin;

    /* --------- giữ nguyên phần xử lý còn lại (như bản trước) -------- */
    const bi   = parseJSON(req.body, 'basicInformation');
    const piv  = parseJSON(req.body, 'pricingAndInventory');
    const desc = parseJSON(req.body, 'description');
    const tech = parseJSON(req.body, 'technicalDetails');
    const seo  = parseJSON(req.body, 'seo');
    const pol  = parseJSON(req.body, 'policy');
    /* ... save & log như cũ ... */

  } catch (err) {
    const code = err.message.includes('PIN') ? StatusCodes.ERROR_UNAUTHORIZED
                                             : StatusCodes.ERROR_BAD_REQUEST;
    return sendError(res, code, err.message);
  }
};

/* ======================================================================== */
/* 5. PATCH /products/:id/inventory – Nhập/xuất kho (🔐)                    */
/* ======================================================================== */
exports.updateInventory = async (req, res) => {
  try {
    await checkPin(req);             // 🔐
    delete req.body.pin;
  } catch (e) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, e.message);
  }

  const { id } = req.params;
  const { quantity, originalPrice } = req.body;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  /* ... phần còn lại giữ nguyên ... */
};

/* ======================================================================== */
/* 6. PATCH /products/:id/status – Đổi trạng thái (🔐)                       */
/* ======================================================================== */
exports.changeStatus = async (req, res) => {
  try {
    await checkPin(req);             // 🔐
    delete req.body.pin;
  } catch (e) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, e.message);
  }

  /* ... giữ nguyên logic validate & save ... */
};

/* ======================================================================== */
/* 7. DELETE /products/:id  – Xoá sản phẩm (🔐)                              */
/* ======================================================================== */
exports.deleteProduct = async (req, res) => {
  try {
    await checkPin(req);             // 🔐
  } catch (e) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, e.message);
  }

  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  /* ... phần còn lại giữ nguyên (xóa & ghi log) ... */
};

// ===== 8. GET /products/export/csv ===========================================
exports.exportProductsToExcel = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const products = await Product.find(filter)
      .populate('basicInformation.categoryIds', 'name')
      .sort({ updatedAt: -1 })
      .lean();
    if (!products.length)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không có sản phẩm nào');

    const ids = products.map(p => p._id);
    const details = await ProductDetail.find({ _id: { $in: ids } }, 'pricingAndInventory description technicalDetails').lean();
    const map = Object.fromEntries(details.map(d => [d._id.toString(), d]));

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Products');
    ws.columns = [
      { header: 'Tên SP', key: 'name', width: 30 },
      { header: 'SKU', key: 'sku', width: 18 },
      { header: 'Trạng thái', key: 'status', width: 12 },
      { header: 'Giá bán', key: 'salePrice', width: 15 },
      { header: 'Kho', key: 'stock', width: 10 },
      { header: 'Ngày tạo', key: 'created', width: 18 }
    ];

    products.forEach(p => {
      const d = map[p._id.toString()] || {};
      ws.addRow({
        name: p.basicInformation.productName,
        sku: p.basicInformation.sku,
        status: p.basicInformation.status,
        salePrice: d.pricingAndInventory?.salePrice ?? '',
        stock: d.pricingAndInventory?.stockQuantity ?? '',
        created: fmtDate(p.createdAt)
      });
    });

    const buffer = await wb.xlsx.writeBuffer();
    res.setHeader('Content-Disposition', 'attachment; filename="products.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.status(200).send(buffer);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// ===== 9. GET /products/category/:id =========================================
exports.getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 10, status } = req.query;

  if (!isValidId(categoryId))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  // kiểm tra tồn tại danh mục
  const category = await Category.findById(categoryId);
  if (!category)
    return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.CATEGORY_NOT_FOUND);

  // query
  const q = { 'basicInformation.categoryIds': categoryId };
  if (status) q['basicInformation.status'] = status;

  try {
    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(q)
        .populate('basicInformation.categoryIds', 'name')
        .sort({ updatedAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(q)
    ]);

    // merge detail tồn kho/giá bán
    const ids = products.map(p => p._id);
    const details = await ProductDetail.find({ _id: { $in: ids } }, 'pricingAndInventory').lean();
    const map = Object.fromEntries(details.map(d => [d._id.toString(), d.pricingAndInventory]));
    const merged = products.map(p => ({ ...p, pricingAndInventory: map[p._id.toString()] || {} }));

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: merged,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: Number(limit),
      category: {
        id: category._id,
        name: category.name,
        description: category.description
      }
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// ===== 10. GET /products/:id/logs (có phân trang) =============================
exports.getProductLogs = async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 20 } = req.query;   // ⬅️  mặc định 20 log / trang
  const skip = (page - 1) * limit;

  if (!isValidId(id)) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  }

  try {
    const [logs, total] = await Promise.all([
      ProductLog.find({ productId: id })
        .populate('operatorId', 'name email')      // thông tin người thao tác (tuỳ user‑model)
        .sort({ createdAt: -1 })                   // mới nhất trước
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      ProductLog.countDocuments({ productId: id })
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: logs,
      totalItems: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit)
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// ===== 11. GET /products/logs/all ===========================================
exports.getAllProductLogs = async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  try {
    const [logs, total] = await Promise.all([
      ProductLog.find()
        .populate('operatorId', 'name email') // người thao tác
        .populate('productId', 'basicInformation.productName') // tên sản phẩm
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      ProductLog.countDocuments()
    ]);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: logs,
      totalItems: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit)
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

