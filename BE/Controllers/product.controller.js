const mongoose = require('mongoose');
const slugify = require('slugify');
const ExcelJS = require('exceljs');

const Product = require('../Models/Products');
const ProductDetail = require('../Models/ProductDetail');
const Category = require('../Models/Categories');
const ProductLog = require('../Models/ProductLog');
const Storage = require('../Models/Storage');

const checkPin = require('../Utils/checkPin');          // 🔐
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');
require('dotenv').config();

/* -------------------- CONST & HELPER ------------------------------------- */
const ALLOWED_STATUS = ['Hiển Thị', 'Ẩn', 'Ngừng Bán'];
const STATUS_FLOW = {
  'Hiển Thị': ['Ẩn', 'Ngừng Bán'],
  'Ẩn': ['Hiển Thị', 'Ngừng Bán'],
  'Ngừng Bán': []
};

const isValidId = id => mongoose.Types.ObjectId.isValid(id);
const regex = txt => new RegExp(`^${txt}`, 'i');
const fmtDate = d => new Date(d).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const parseJSON = (body, field) => {
  try { return JSON.parse(body[field] || '{}'); }
  catch (e) { throw new Error(`JSON không hợp lệ ở "${field}": ${e.message}`); }
};
const buildFilter = ({ name, status, categoryId }) => {
  const f = {};
  if (typeof name === 'string' && name.trim() !== '') f['basicInformation.productName'] = regex(name.trim());
  if (typeof status === 'string' && status.trim() !== '') f['basicInformation.status'] = status.trim();
  if (typeof categoryId === 'string' && categoryId.trim() !== '') f['basicInformation.categoryIds'] = categoryId.trim();
  return f;
};
const logAction = (productId, action, operatorId, payload = {}) =>
  ProductLog.create({ productId, action, operatorId, payload });

// Helper để gộp Product + ProductDetail
const mergeProductAndDetail = (product, detail) => {
  if (!product) return null;
  // Đảm bảo _id là id của Products.js, detailId là id của ProductDetail.js
  const merged = { ...detail, ...product };
  merged._id = product._id; // luôn là id của Products.js
  merged.detailId = product.detailId; // luôn là id của ProductDetail.js
  return merged;
};

// Helper để trả về dạng { product, detail }
const combineProductAndDetail = (product, detail) => {
  if (!product) return null;
  return { product, detail: detail || null };
};

/* ======================================================================== */
/* 1. GET /products                                                         */
/* ======================================================================== */
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = buildFilter(req.query);
    const skip = (page - 1) * limit;
    const products = await Product.find({ ...filter, isDeleted: false })
      .sort({ createdAt: -1, updatedAt: -1 })
      .skip(Number(skip)).limit(Number(limit))
      .populate('basicInformation.categoryIds', 'name')
      .populate('basicInformation.tagIds', 'name')
      .lean();
    const ids = products.map(p => p.detailId);
    const details = await ProductDetail.find({ _id: { $in: ids } }).lean();
    console.log('Detail IDs:', ids);
    console.log('Details found:', details);
    const map = Object.fromEntries(details.map(d => [d._id.toString(), d]));
    const combined = products.map(p => combineProductAndDetail(p, map[p.detailId?.toString()] || null));
    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: combined,
      currentPage: +page,
      totalPages: Math.ceil((await Product.countDocuments({ ...filter, isDeleted: false })) / limit),
      totalItems: await Product.countDocuments({ ...filter, isDeleted: false }),
      perPage: +limit
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
    const product = await Product.findOne({ _id: id, isDeleted: false })
      .populate('basicInformation.categoryIds', 'name')
      .populate('basicInformation.tagIds', 'name')
      .lean();
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    const detail = product.detailId ? await ProductDetail.findOne({ _id: product.detailId, isDeleted: false }).lean() : null;
    return sendSuccess(res, StatusCodes.SUCCESS_OK, combineProductAndDetail(product, detail));
  } catch (e) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, e.message);
  }
};

/* ======================================================================== */
/* 3. POST /products  – Tạo sản phẩm (🔐CHECK PIN)                          */
/* ======================================================================== */
exports.createProduct = async (req, res) => {
  try {
    // Parse dữ liệu
    const bi = parseJSON(req.body, 'basicInformation');
    const piv = parseJSON(req.body, 'pricingAndInventory');
    const desc = parseJSON(req.body, 'description');
    const tech = parseJSON(req.body, 'technicalDetails');
    const seo = parseJSON(req.body, 'seo');
    const pol = parseJSON(req.body, 'policy');
    const batchCode = req.body.batchCode;
    console.log(req.body, "basicInformation");
    // Validate trường bắt buộc
    if (!bi.productName || !bi.sku) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_REQUIRED);
    }
    if (!Array.isArray(bi.tagIds) || bi.tagIds.length === 0) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Vui lòng chọn ít nhất một tag!');
    }
    if (!Array.isArray(bi.categoryIds) || bi.categoryIds.length === 0) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Vui lòng chọn ít nhất một danh mục!');
    }
    if (!piv || piv.originalPrice == null || piv.salePrice == null || piv.stockQuantity == null || !piv.unit) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Vui lòng nhập đầy đủ thông tin giá và tồn kho!');
    }
    // Validate ảnh
    if (!req.uploadedImages || req.uploadedImages.length === 0) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.IMAGE_REQUIRED);
    }
    // Sửa status mặc định nếu FE gửi sai
    if (!bi.status || !['Hiển Thị', 'Ẩn', 'Ngừng Bán'].includes(bi.status)) {
      bi.status = 'Hiển Thị';
    }
    // Đảm bảo tagIds là mảng, không null
    if (!Array.isArray(bi.tagIds)) bi.tagIds = [];
    // Đảm bảo categoryIds là mảng
    if (!Array.isArray(bi.categoryIds)) bi.categoryIds = [];
    // Xử lý technicalDetails: nếu trường nào là object thì chuyển thành chuỗi rỗng
    Object.keys(tech || {}).forEach(key => {
      if (typeof tech[key] === 'object' && tech[key] !== null && !Array.isArray(tech[key])) tech[key] = '';
    });
    // Đảm bảo các trường mảng trong detail là mảng
    if (desc) {
      if (!Array.isArray(desc.features)) desc.features = desc.features ? [desc.features] : [];
      if (!Array.isArray(desc.ingredients)) desc.ingredients = desc.ingredients ? [desc.ingredients] : [];
      if (!Array.isArray(desc.usageInstructions)) desc.usageInstructions = desc.usageInstructions ? [desc.usageInstructions] : [];
    }
    if (tech) {
      if (!Array.isArray(tech.suitableSkinTypes)) tech.suitableSkinTypes = tech.suitableSkinTypes ? [tech.suitableSkinTypes] : [];
      if (!Array.isArray(tech.certifications)) tech.certifications = tech.certifications ? [tech.certifications] : [];
    }
    if (seo) {
      if (!seo.urlSlug || seo.urlSlug.trim() === '') {
        const base = bi.productName || bi.sku || '';
        seo.urlSlug = slugify(base, { lower: true, strict: true });
      }
    }
    if (pol) {
      if (!Array.isArray(pol.shippingReturnWarranty)) pol.shippingReturnWarranty = pol.shippingReturnWarranty ? [pol.shippingReturnWarranty] : [];
      if (!Array.isArray(pol.additionalOptions)) pol.additionalOptions = pol.additionalOptions ? [pol.additionalOptions] : [];
    }
    // Xử lý file ảnh từ GridFS (upload.middleware.js)
    let images = [];
    if (req.uploadedImages && req.uploadedImages.length > 0) {
      images = req.uploadedImages.map(file => ({
        _id: file._id,
        filename: file.filename,
        mimetype: file.contentType,
        path: `/admin/media/${file._id}`
      }));
    }
    // Tạo _id trước
    const detailId = new mongoose.Types.ObjectId();
    // Tạo Product với detailId tạm thời
    const product = new Product({ basicInformation: bi, detailId, isDeleted: false });
    await product.save();
    // Tạo ProductDetail với _id trùng detailId
    const detail = new ProductDetail({
      _id: detailId,
      pricingAndInventory: piv,
      description: desc,
      technicalDetails: tech,
      seo: seo,
      policy: pol,
      batchCode: batchCode,
      mediaFiles: { images },
      isDeleted: false
    });
    await detail.save();
    // Gộp trả về 1 object
    const merged = mergeProductAndDetail(product.toObject(), detail.toObject());
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, merged, 'Tạo sản phẩm thành công');
  } catch (err) {
    if (err.code === 11000 && err.message.includes('sku')) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'SKU_EXISTS');
    }
    if (err.code === 11000 && err.message.includes('urlSlug')) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'URLSLUG_EXISTS');
    }
    const code = err.message.includes('PIN') ? StatusCodes.ERROR_UNAUTHORIZED
      : StatusCodes.ERROR_BAD_REQUEST;
    return sendError(res, code, err.message);
  }
};

/* ======================================================================== */
/* 4. PUT /products/:id – Cập nhật mô tả chung (🔐)                         */
/* ======================================================================== */
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  try {
    const bi = parseJSON(req.body, 'basicInformation');
    const piv = parseJSON(req.body, 'pricingAndInventory');
    const desc = parseJSON(req.body, 'description');
    const tech = parseJSON(req.body, 'technicalDetails');
    const seo = parseJSON(req.body, 'seo');
    const pol = parseJSON(req.body, 'policy');
    const batchCode = req.body.batchCode;
    // Đảm bảo các trường mảng trong detail là mảng
    if (desc) {
      if (!Array.isArray(desc.features)) desc.features = desc.features ? [desc.features] : [];
      if (!Array.isArray(desc.ingredients)) desc.ingredients = desc.ingredients ? [desc.ingredients] : [];
      if (!Array.isArray(desc.usageInstructions)) desc.usageInstructions = desc.usageInstructions ? [desc.usageInstructions] : [];
    }
    if (tech) {
      if (!Array.isArray(tech.suitableSkinTypes)) tech.suitableSkinTypes = tech.suitableSkinTypes ? [tech.suitableSkinTypes] : [];
      if (!Array.isArray(tech.certifications)) tech.certifications = tech.certifications ? [tech.certifications] : [];
    }
    if (seo) {
      if (!seo.urlSlug || seo.urlSlug.trim() === '') {
        const base = bi.productName || bi.sku || '';
        seo.urlSlug = slugify(base, { lower: true, strict: true });
      }
    }
    if (pol) {
      if (!Array.isArray(pol.shippingReturnWarranty)) pol.shippingReturnWarranty = pol.shippingReturnWarranty ? [pol.shippingReturnWarranty] : [];
      if (!Array.isArray(pol.additionalOptions)) pol.additionalOptions = pol.additionalOptions ? [pol.additionalOptions] : [];
    }
    await Product.findByIdAndUpdate(id, { basicInformation: bi });
    const product = await Product.findOne({ _id: id, isDeleted: false }).lean();
    if (product && product.detailId) {
      await ProductDetail.findByIdAndUpdate(product.detailId, {
        pricingAndInventory: piv,
        description: desc,
        technicalDetails: tech,
        seo: seo,
        policy: pol,
        batchCode: batchCode
      });
    }
    const updatedProduct = await Product.findOne({ _id: id, isDeleted: false })
      .populate('basicInformation.categoryIds', 'name')
      .populate('basicInformation.tagIds', 'name')
      .lean();
    const updatedDetail = product && product.detailId
      ? await ProductDetail.findOne({ _id: product.detailId, isDeleted: false }).lean()
      : null;
    const merged = mergeProductAndDetail(updatedProduct, updatedDetail);
    return sendSuccess(res, StatusCodes.SUCCESS_OK, merged, 'Cập nhật sản phẩm thành công');
  } catch (err) {
    if (err.code === 11000 && err.message.includes('sku')) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'SKU_EXISTS');
    }
    if (err.code === 11000 && err.message.includes('urlSlug')) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'URLSLUG_EXISTS');
    }
    const code = err.message.includes('PIN') ? StatusCodes.ERROR_UNAUTHORIZED
      : StatusCodes.ERROR_BAD_REQUEST;
    return sendError(res, code, err.message);
  }
};

/* ======================================================================== */
/* 6. PATCH /products/:id/status – Đổi trạng thái (🔐)                       */
/* ======================================================================== */
exports.changeStatus = async (req, res) => {
  try {
    await checkPin(req);             // 🔐
    delete req.body.pin;
  } catch (e) {
    return sendError(res, StatusCodes.ERROR_UNAUTHORIZED, e.message);
  }
  const { id } = req.params;
  const { status } = req.body;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  try {
    const product = await Product.findOne({ _id: id, isDeleted: false });
    if (!product) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    const oldStatus = product.basicInformation.status;
    if (oldStatus !== status) {
      product.basicInformation.status = status;
      await product.save();
      await logAction(id, 'STATUS', req.user?._id, { from: oldStatus, to: status });
    }
    return sendSuccess(res, StatusCodes.SUCCESS_OK, product, 'Đổi trạng thái thành công');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

/* ======================================================================== */
/* 7. DELETE /products/:id  – Xoá sản phẩm (🔐)                              */
/* ======================================================================== */
exports.deleteProduct = async (req, res) => {
  // KHÔNG cần checkPin ở đây nữa
  const { id } = req.params;
  if (!isValidId(id))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  try {
    const product = await Product.findOne({ _id: id, isDeleted: false }).lean();
    if (!product) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    const detail = product.detailId ? await ProductDetail.findOne({ _id: product.detailId, isDeleted: false }).lean() : null;
    // Xóa mềm: cập nhật isDeleted=true
    await Product.updateOne({ _id: id }, { isDeleted: true });
    if (product.detailId) await ProductDetail.updateOne({ _id: product.detailId }, { isDeleted: true });
    const merged = mergeProductAndDetail(product, detail);
    await logAction(id, 'DELETE', req.user?._id, { product, detail });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, merged, 'Xóa sản phẩm thành công');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// ===== 8. GET /products/export/csv ===========================================
exports.exportProductsToExcel = async (req, res) => {
  try {
    const filter = buildFilter(req.query);
    const products = await Product.find({ ...filter, isDeleted: false })
      .populate('basicInformation.categoryIds', 'name')
      .sort({ updatedAt: -1 })
      .lean();
    if (!products.length)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không có sản phẩm nào');

    const ids = products.map(p => p._id);
    const details = await ProductDetail.find({ _id: { $in: ids }, isDeleted: false }, 'pricingAndInventory description technicalDetails').lean();
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
    const products = await Product.find({ ...q, isDeleted: false })
      .populate('basicInformation.categoryIds', 'name')
      .populate('basicInformation.tagIds', 'name')
      .sort({ updatedAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .lean();
    const ids = products.map(p => p.detailId);
    const details = await ProductDetail.find({ _id: { $in: ids }, isDeleted: false }).lean();
    const map = Object.fromEntries(details.map(d => [d._id.toString(), d]));
    const combined = products.map(p => combineProductAndDetail(p, map[p.detailId?.toString()] || null));

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: combined,
      currentPage: Number(page),
      totalPages: Math.ceil((await Product.countDocuments({ ...q, isDeleted: false })) / limit),
      totalItems: await Product.countDocuments({ ...q, isDeleted: false }),
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
      ProductLog.find({ productId: id, isDeleted: false })
        .populate('operatorId', 'name email')      // thông tin người thao tác (tuỳ user‑model)
        .sort({ createdAt: -1 })                   // mới nhất trước
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      ProductLog.countDocuments({ productId: id, isDeleted: false })
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
      ProductLog.find({ isDeleted: false })
        .populate('operatorId', 'name email') // người thao tác
        .populate('productId', 'basicInformation.productName') // tên sản phẩm
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      ProductLog.countDocuments({ isDeleted: false })
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

// 12. BULK IMPORT INVENTORY (NHẬP KHO NHIỀU SẢN PHẨM)
exports.bulkImportInventory = async (req, res) => {
  try {
    // Lấy thông tin phiếu nhập
    const {
      billCode, billDate, createdBy, receivedBy, supplier, supplierCode, supplierAddress, supplierPhone, supplierEmail,
      poNumber, paymentMethod, shippingFee, discount, vat, note,
      products = [], totalBeforeDiscount, totalDiscount, totalAfterDiscount, totalVAT, totalFinal
    } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Danh sách sản phẩm nhập kho không hợp lệ!');
    }
    // Duyệt từng sản phẩm để cập nhật tồn kho
    const results = [];
    for (const p of products) {
      const { productId, quantity, originalPrice, batchCode, mfgDate, expDate, note: productNote } = p;
      if (!isValidId(productId)) continue;
      // Cập nhật tồn kho và giá nhập
      let detail = await ProductDetail.findOne({ _id: productId, isDeleted: false });
      if (!detail) {
        const product = await Product.findOne({ _id: productId, isDeleted: false });
        if (product && product.detailId) {
          detail = await ProductDetail.findOne({ _id: product.detailId, isDeleted: false });
        }
      }
      if (!detail) continue;
      // Lưu giá và tồn kho cũ để log
      const oldStock = detail.pricingAndInventory.stockQuantity || 0;
      const oldPrice = detail.pricingAndInventory.originalPrice || 0;
      // CỘNG DỒN số lượng nhập vào tồn kho hiện có
      if (typeof quantity === 'number' && quantity > 0) {
        detail.pricingAndInventory.stockQuantity = oldStock + quantity;
      }
      // Cập nhật giá nhập mới nếu có
      if (typeof originalPrice === 'number' && originalPrice >= 0) {
        detail.pricingAndInventory.originalPrice = originalPrice;
      }
      // Cập nhật batchCode, NSX, HSD, note nếu có
      if (batchCode) detail.batchCode = batchCode;
      if (mfgDate) detail.mfgDate = mfgDate;
      if (expDate) detail.expDate = expDate;
      if (productNote) detail.note = productNote;
      await detail.save();
      // Log thao tác nhập kho (phiếu)
      await logAction(productId, 'Nhập kho (phiếu)', req.user?._id, {
        quantity, originalPrice, batchCode, mfgDate, expDate, productNote,
        billCode, billDate, createdBy, receivedBy, supplier, supplierCode, supplierAddress, supplierPhone, supplierEmail,
        poNumber, paymentMethod, shippingFee, discount, vat, note,
        totalBeforeDiscount, totalDiscount, totalAfterDiscount, totalVAT, totalFinal
      });
      // Log nhập kho từng sản phẩm
      await logAction(productId, 'IMPORT', req.user?._id, {
        quantity, originalPrice, batchCode, mfgDate, expDate, productNote
      });
      // Nếu tồn kho thay đổi, log UPDATE_STOCK
      if (typeof quantity === 'number' && quantity > 0) {
        await logAction(productId, 'UPDATE_STOCK', req.user?._id, { from: oldStock, to: detail.pricingAndInventory.stockQuantity });
      }
      // Nếu giá thay đổi, log UPDATE_PRICE
      if (typeof originalPrice === 'number' && originalPrice !== oldPrice) {
        await logAction(productId, 'UPDATE_PRICE', req.user?._id, { from: oldPrice, to: originalPrice });
      }
      results.push({ productId, success: true });
    }
    // Có thể lưu thêm 1 collection riêng cho phiếu nhập nếu muốn (chưa làm ở đây)
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { results }, 'Nhập kho hàng loạt thành công');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// DUYỆT PHIẾU NHẬP KHO
exports.approveImportInventory = async (req, res) => {
  try {
    const { storageId } = req.body;
    if (!isValidId(storageId)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'ID phiếu nhập kho không hợp lệ!');
    const storage = await Storage.findById(storageId);
    if (!storage) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy phiếu nhập kho!');
    if (storage.status === 'Đã Duyệt') return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Phiếu đã được duyệt!');
    // Cộng tồn kho vào ProductDetail
    const detail = await ProductDetail.findById(storage.productDetail);
    if (!detail) return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không tìm thấy chi tiết sản phẩm!');
    const oldStock = detail.pricingAndInventory.stockQuantity || 0;
    detail.pricingAndInventory.stockQuantity = oldStock + storage.quantity;
    await detail.save();
    // Đánh dấu đã duyệt
    storage.status = 'Đã Duyệt';
    await storage.save();
    // Log thao tác
    await logAction(storage.product, 'APPROVE_IMPORT', req.user?._id, { storageId, quantity: storage.quantity });
    await logAction(storage.product, 'UPDATE_STOCK', req.user?._id, { from: oldStock, to: detail.pricingAndInventory.stockQuantity });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { storageId }, 'Duyệt phiếu nhập kho thành công');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// LẤY DANH SÁCH PHIẾU NHẬP KHO (STORAGE)
exports.getAllImportStorage = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const skip = (page - 1) * limit;
    const filter = { type: 'import' };
    if (status) filter.status = status;
    const [storages, total] = await Promise.all([
      Storage.find(filter)
        .populate('product', 'basicInformation')
        .populate('productDetail', 'pricingAndInventory')
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .lean(),
      Storage.countDocuments(filter)
    ]);
    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: storages,
      totalItems: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      perPage: Number(limit)
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};
