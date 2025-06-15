const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const path = require('path');
const ExcelJS = require('exceljs');
const moment = require('moment')
const { Parser } = require('json2csv');
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

const formatDate = (date) =>
  new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

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

// GET by ID
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

// POST
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

// PUT
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

// DELETE
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

function helperGetFilterFromQuery(query) {
  const { name, status, brand, categoryId, all } = query;
  const filter = {};
  if (!all) {
    if (name) filter['basicInformation.productName'] = new RegExp(name, 'i');
    if (status) filter['basicInformation.status'] = status;
    if (brand) filter['basicInformation.brand'] = brand;
    if (categoryId) filter['basicInformation.categoryIds'] = categoryId;
  }
  return filter;
}

exports.exportProductsToExcel = async (req, res) => {
  try {
    const filter = helperGetFilterFromQuery(req.query);

    const products = await Product.find(filter)
      .populate('basicInformation.categoryIds', 'name')
      .sort({ updatedAt: -1, createdAt: -1 });

    if (!products.length) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, 'Không có sản phẩm nào để xuất.');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Danh sách sản phẩm');

    // Định nghĩa tiêu đề cột
    const columns = [
      { header: 'Product Name', key: 'productName' },
      { header: 'SKU', key: 'sku' },
      { header: 'Brand', key: 'brand' },
      { header: 'Status', key: 'status' },
      { header: 'Origin', key: 'origin' },
      { header: 'Price (VND)', key: 'price' },
      { header: 'Original Price (VND)', key: 'originalPrice' },
      { header: 'Stock', key: 'stock' },
      { header: 'Unit', key: 'unit' },
      { header: 'Short Description', key: 'shortDescription' },
      { header: 'Category Names', key: 'categories' },
      { header: 'Created At', key: 'createdAt' },
      { header: 'Updated At', key: 'updatedAt' },
    ];

    worksheet.columns = columns;

    // Ghi dữ liệu
    for (const p of products) {
      worksheet.addRow({
        productName: p.basicInformation?.productName || '',
        sku: p.basicInformation?.sku || '',
        brand: p.basicInformation?.brand || '',
        status: p.basicInformation?.status || '',
        origin: p.technicalDetails?.origin || '',
        price: p.pricingAndInventory?.salePrice ?? '',
        originalPrice: p.pricingAndInventory?.originalPrice ?? '',
        stock: p.pricingAndInventory?.stockQuantity ?? '',
        unit: p.pricingAndInventory?.unit || '',
        shortDescription: p.description?.shortDescription || '',
        categories: (p.basicInformation?.categoryIds || []).map(c => c?.name).join(', '),
        createdAt: moment(p.createdAt).format('DD/MM/YYYY HH:mm'),
        updatedAt: moment(p.updatedAt).format('DD/MM/YYYY HH:mm')
      });
    }

    // Format tiêu đề
    worksheet.getRow(1).eachCell(cell => {
      cell.font = { bold: true, name: 'Calibri', color: { argb: 'FFFFFFFF' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4F81BD' }  // xanh đậm
      };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' }, bottom: { style: 'thin' },
        left: { style: 'thin' }, right: { style: 'thin' }
      };
    });

    // Auto width cho từng cột
    worksheet.columns.forEach(col => {
      let maxLength = col.header.length;
      col.eachCell?.({ includeEmpty: true }, cell => {
        const value = cell.value ? cell.value.toString() : '';
        maxLength = Math.max(maxLength, value.length);
      });
      col.width = maxLength + 2;
    });

    const fileName = `products-${Date.now()}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('[Excel Export Error]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Xuất Excel thất bại. Vui lòng thử lại.');
  }
};
