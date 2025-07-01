// controllers/product.controller.js – FULL REWRITE
// =============================================================================
//  💼  Product Controller (tách bảng Product & ProductDetail)
//  • Trạng thái enum: ['Hiển Thị', 'Ẩn', 'Ngừng Bán']
//  • Ghi log mọi thao tác vào ProductLog
//  • Không chứa logic phân quyền
// =============================================================================

// ===== Imports ===============================================================
const mongoose   = require('mongoose');
const slugify    = require('slugify');
const ExcelJS    = require('exceljs');
const Product       = require('../Models/Products');
const ProductDetail = require('../Models/ProductDetail');
const Category      = require('../Models/Categories');
const ProductLog    = require('../Models/ProductLog');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages    = require('../Constants/ResponseMessage');
require('dotenv').config();

// ===== Constants & Helpers ===================================================
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

const logAction = async (productId, action, operatorId, payload = {}) => {
  await ProductLog.create({ productId, action, operatorId, payload });
};

// ===== 1. GET /products ======================================================
exports.getAllProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const filter = buildFilter(req.query);

    const skip = (page - 1) * limit;
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort({ updatedAt: -1 })
        .skip(Number(skip))
        .limit(Number(limit))
        .populate('basicInformation.categoryIds', 'name')
        .lean(),
      Product.countDocuments(filter)
    ]);

    const ids = products.map(p => p._id);
    const details = await ProductDetail.find({ _id: { $in: ids } }, 'pricingAndInventory').lean();
    const map = Object.fromEntries(details.map(d => [d._id.toString(), d.pricingAndInventory]));
    const merged = products.map(p => ({ ...p, pricingAndInventory: map[p._id.toString()] || {} }));

    return sendSuccess(res, StatusCodes.SUCCESS_OK, {
      data: merged,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      totalItems: total,
      perPage: Number(limit)
    });
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// ===== 2. GET /products/:id ===================================================
exports.getProductById = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  try {
    const product = await Product.findById(id).populate('basicInformation.categoryIds', 'name').lean();
    if (!product) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    const detail  = await ProductDetail.findById(id).lean();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { ...product, ...detail });
  } catch (e) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, e.message);
  }
};

// ===== 3. POST /products =====================================================
exports.createProduct = async (req, res) => {
  try {
    const bi   = parseJSON(req.body, 'basicInformation');
    const piv  = parseJSON(req.body, 'pricingAndInventory');
    const desc = parseJSON(req.body, 'description');
    const tech = parseJSON(req.body, 'technicalDetails');
    const seo  = parseJSON(req.body, 'seo');
    const pol  = parseJSON(req.body, 'policy');

    // validation
    if (!bi.productName || !bi.sku)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_REQUIRED);
    if (!Array.isArray(bi.tagIds) || !bi.tagIds.length)
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Sản phẩm phải có ít nhất một tag.');

    bi.brand  = bi.brand  || 'CoCo';
    bi.status = bi.status || 'Hiển Thị';
    if (!ALLOWED_STATUS.includes(bi.status))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Trạng thái không hợp lệ');

    const [dupName, dupSku] = await Promise.all([
      Product.exists({ 'basicInformation.productName': bi.productName }),
      Product.exists({ 'basicInformation.sku': bi.sku })
    ]);
    if (dupName) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
    if (dupSku)  return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);

    // slug unique
    const baseSlug = slugify(bi.productName, { lower: true, strict: true, locale: 'vi' });
    let slug = baseSlug, idx = 1; while (await ProductDetail.exists({ 'seo.urlSlug': slug })) slug = `${baseSlug}-${idx++}`;

    // images
    const imgs = req.uploadedImages || [];
    if (!imgs.length) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.IMAGE_REQUIRED);
    const [mainImg, ...gallery] = imgs;

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const [prod] = await Product.create([{ basicInformation: bi, detailId: undefined }], { session });
      await ProductDetail.create([{
        _id: prod._id,
        pricingAndInventory: piv,
        description: desc,
        technicalDetails: tech,
        seo: { ...seo, urlSlug: slug },
        policy: pol,
        media: {
          mainImage: `/media/${mainImg._id}`,
          imageGallery: (gallery.length ? gallery : [mainImg]).map(i => `/media/${i._id}`),
          videoUrl: null
        },
        mediaFiles: {
          images: imgs.map(i => ({ path: `/media/${i._id}`, filename: i.filename, mimetype: i.contentType, size: i.size })),
          videos: []
        }
      }], { session });

      prod.detailId = prod._id;
      await prod.save({ session });
      await logAction(prod._id, 'CREATE', req.user?._id);
      await session.commitTransaction();
      return sendSuccess(res, StatusCodes.SUCCESS_CREATED, { product: prod }, Messages.PRODUCT_CREATED);
    } catch (e) {
      await session.abortTransaction();
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, e.message);
    } finally { session.endSession(); }
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, err.message);
  }
};

// ===== 4. PUT /products/:id (update common) ==================================
exports.updateProduct = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);

  try {
    const bi   = parseJSON(req.body, 'basicInformation');
    const piv  = parseJSON(req.body, 'pricingAndInventory'); // only salePrice allowed
    const desc = parseJSON(req.body, 'description');
    const tech = parseJSON(req.body, 'technicalDetails');
    const seo  = parseJSON(req.body, 'seo');
    const pol  = parseJSON(req.body, 'policy');

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      const product = await Product.findById(id).session(session);
      const detail  = await ProductDetail.findById(id).session(session);
      if (!product || !detail) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

      // duplicate checks
      if (bi.productName && bi.productName !== product.basicInformation.productName) {
        if (await Product.exists({ 'basicInformation.productName': bi.productName, _id: { $ne: id } }))
          return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
        const baseSlug = slugify(bi.productName, { lower: true, strict: true, locale: 'vi' });
        let slug = baseSlug, i = 1; while (await ProductDetail.exists({ 'seo.urlSlug': slug, _id: { $ne: id } })) slug = `${baseSlug}-${i++}`;
        detail.seo.urlSlug = slug;
      }
      if (bi.sku && bi.sku !== product.basicInformation.sku) {
        if (await Product.exists({ 'basicInformation.sku': bi.sku, _id: { $ne: id } }))
          return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);
      }

      // merge fields
      product.basicInformation = { ...product.basicInformation, ...bi };
      detail.description       = { ...detail.description,      ...desc };
      detail.technicalDetails  = { ...detail.technicalDetails, ...tech };
      detail.policy            = { ...detail.policy,           ...pol };
      detail.seo               = { ...detail.seo,              ...seo };

      if (piv.salePrice !== undefined) detail.pricingAndInventory.salePrice = piv.salePrice;
      if (piv.originalPrice !== undefined || piv.stockQuantity !== undefined)
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Không được sửa tồn kho hoặc giá nhập ở endpoint này');

      // images if uploaded
      if (req.uploadedImages?.length) {
        const imgs = req.uploadedImages;
        if (imgs.length > 6) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.MAX_IMAGE_COUNT_EXCEEDED);
        const [mainImg, ...gallery] = imgs;
        detail.media.mainImage    = `/media/${mainImg._id}`;
        detail.media.imageGallery = (gallery.length ? gallery : [mainImg]).map(i => `/media/${i._id}`);
        detail.mediaFiles.images  = imgs.map(i => ({ path: `/media/${i._id}`, filename: i.filename, mimetype: i.contentType, size: i.size }));
      }

      await Promise.all([product.save({ session }), detail.save({ session })]);
      await logAction(id, 'UPDATE', req.user?._id);
      await session.commitTransaction();
      return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.PRODUCT_UPDATED);
    } catch (e) {
      await session.abortTransaction();
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, e.message);
    } finally { session.endSession(); }
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, err.message);
  }
};

// ===== 5. PATCH /products/:id/inventory ======================================
exports.updateInventory = async (req, res) => {
  const { id } = req.params;
  const { quantity, originalPrice } = req.body;
  console.log("id",id)
  if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  if (quantity === undefined && originalPrice === undefined)
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Phải truyền "quantity" hoặc "originalPrice".');

  try {
    const detail = await ProductDetail.findById(id);
    if (!detail) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    if (quantity !== undefined) {
      const newStock = detail.pricingAndInventory.stockQuantity + Number(quantity);
      if (newStock < 0)
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Tồn kho sau cập nhật không hợp lệ');
      detail.pricingAndInventory.stockQuantity = newStock;
    }
    if (originalPrice !== undefined)
      detail.pricingAndInventory.originalPrice = Number(originalPrice);

    await detail.save();
    await logAction(id, 'IMPORT', req.user?._id, { quantity, originalPrice });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, detail, 'Nhập kho thành công');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// ===== 6. PATCH /products/:id/status =========================================
exports.changeStatus = async (req, res) => {
  const { id } = req.params;
  const { status: newStatus } = req.body;

  if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  if (!ALLOWED_STATUS.includes(newStatus))
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Trạng thái không hợp lệ');

  try {
    const product = await Product.findById(id);
    if (!product) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    const current = product.basicInformation.status;
    if (!STATUS_FLOW[current].includes(newStatus))
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, `Không thể chuyển từ ${current} → ${newStatus}`);

    product.basicInformation.status = newStatus;
    await product.save();
    await logAction(id, 'STATUS', req.user?._id, { from: current, to: newStatus });
    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, 'Đã đổi trạng thái');
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
};

// ===== 7. DELETE /products/:id ===============================================
exports.deleteProduct = async (req, res) => {
  const { id } = req.params;
  if (!isValidId(id)) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  try {
    const [prodDel, detailDel] = await Promise.all([
      Product.findByIdAndDelete(id),
      ProductDetail.findByIdAndDelete(id)
    ]);
    if (!prodDel) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    await logAction(id, 'DELETE', req.user?._id);
    return sendSuccess(res, StatusCodes.SUCCESS_OK, null, Messages.PRODUCT_DELETED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
  }
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

