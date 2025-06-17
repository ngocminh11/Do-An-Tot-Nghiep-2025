const Product = require('../Models/Products');
const Category = require('../Models/Categories');
const path = require('path');
const ExcelJS = require('exceljs');
const moment = require('moment');
const slugify = require('slugify');
const mongoose = require('mongoose');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const StatusCodes = require('../Constants/ResponseCode');
const Messages = require('../Constants/ResponseMessage');
require('dotenv').config();

const isValidId = id => mongoose.Types.ObjectId.isValid(id);
const formatDate = date => new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
const buildRegexSearch = value => new RegExp(`^${value}`, 'i');
const buildImageUrl = filename => `${process.env.SERVER_URL}/uploads/${filename}`;

const helperGetFilterFromQuery = query => {
  const { name, status, brand, categoryId, all } = query;
  const filter = {};
  if (!all) {
    if (name) filter['basicInformation.productName'] = new RegExp(name, 'i');
    if (status) filter['basicInformation.status'] = status;
    if (brand) filter['basicInformation.brand'] = brand;
    if (categoryId) filter['basicInformation.categoryIds'] = categoryId;
  }
  return filter;
};

exports.getAllProducts = async (req, res) => {
  try {
    const { name, status, page = 1, limit = 10 } = req.query;
    const query = {};

    if (name) query['basicInformation.productName'] = buildRegexSearch(name);
    if (status) query['basicInformation.status'] = status;

    const skip = (page - 1) * limit;
    const [products, totalItems] = await Promise.all([
      Product.find(query)
        .sort({ updatedAt: -1, createdAt: -1 })
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
    const product = await Product.findById(id)
      .populate('basicInformation.categoryIds', 'name');
    if (!product)
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);

    return sendSuccess(res, StatusCodes.SUCCESS_OK, product);
  } catch (error) {
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, error.message);
  }
};

exports.createProduct = async (req, res) => {
  let basicInformation = {};
  let pricingAndInventory = {};
  let description = {};
  let technicalDetails = {};
  let seo = {};
  let policy = {};

  try {
    basicInformation = JSON.parse(req.body.basicInformation || '{}');
    pricingAndInventory = JSON.parse(req.body.pricingAndInventory || '{}');
    description = JSON.parse(req.body.description || '{}');
    technicalDetails = JSON.parse(req.body.technicalDetails || '{}');
    seo = JSON.parse(req.body.seo || '{}');
    policy = JSON.parse(req.body.policy || '{}');
    console.log(seo);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, 'Dữ liệu JSON không hợp lệ: ' + err.message);
  }

  if (!basicInformation.productName || !basicInformation.sku) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_REQUIRED);
  }

  const [nameExists, skuExists] = await Promise.all([
    Product.findOne({ 'basicInformation.productName': basicInformation.productName }),
    Product.findOne({ 'basicInformation.sku': basicInformation.sku })
  ]);

  if (nameExists)
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
  if (skuExists)
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);

  // === Tạo slug từ productName ===
  let baseSlug = slugify(basicInformation.productName, {
    lower: true,
    strict: true,
    locale: 'vi'
  });
  let slug = baseSlug;
  let i = 1;
  while (await Product.findOne({ 'seo.urlSlug': slug })) {
    slug = `${baseSlug}-${i++}`;
  }

  const uploadedImages = req.uploadedImages;
  if (!uploadedImages || uploadedImages.length === 0) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.IMAGE_REQUIRED);
  }

  const mainImage = uploadedImages[0];
  let imageGallery = uploadedImages.slice(1);

  // Nếu không đủ ảnh cho gallery thì thêm mainImage vào gallery
  if (imageGallery.length === 0) {
    imageGallery.push(mainImage);
  }

  const product = new Product({
    basicInformation,
    pricingAndInventory,
    description,
    technicalDetails,
    seo: {
      ...seo,
      urlSlug: slug
    },
    policy,
    media: {
      mainImage: `/media/${mainImage._id}`,
      imageGallery: imageGallery.map(file => `/media/${file._id}`),
      videoUrl: null
    },
    mediaFiles: {
      images: uploadedImages.map(file => ({
        path: `/media/${file._id}`,
        filename: file.filename,
        mimetype: file.contentType,
        size: file.size
      })),
      videos: []
    }
  });

  try {
    const saved = await product.save();
    return sendSuccess(res, StatusCodes.SUCCESS_CREATED, { product: saved }, Messages.PRODUCT_CREATED);
  } catch (err) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, err.message);
  }
};

exports.updateProduct = async (req, res) => {
  const { id } = req.params;

  // 1. Validate ID
  if (!isValidId(id)) {
    return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
  }

  try {
    // 2. Tìm sản phẩm
    const product = await Product.findById(id);
    if (!product) {
      return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
    }

    // 3. Parse body an toàn
    let parsedData = {};
    const fieldsToParse = [
      'basicInformation', 'pricingAndInventory',
      'description', 'technicalDetails',
      'seo', 'policy'
    ];

    try {
      for (const field of fieldsToParse) {
        parsedData[field] = JSON.parse(req.body[field] || '{}');
      }
    } catch (err) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, `Dữ liệu JSON không hợp lệ: ${err.message}`);
    }

    const { basicInformation, pricingAndInventory, description, technicalDetails, seo, policy } = parsedData;
    const { productName, sku } = basicInformation;

    // 4. Kiểm tra trùng productName, sku
    const [nameExists, skuExists] = await Promise.all([
      productName
        ? Product.findOne({ 'basicInformation.productName': productName, _id: { $ne: id } })
        : null,
      sku
        ? Product.findOne({ 'basicInformation.sku': sku, _id: { $ne: id } })
        : null
    ]);

    if (nameExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
    if (skuExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);

    // 5. Cập nhật slug nếu tên đổi
    if (productName && productName !== product.basicInformation.productName) {
      const baseSlug = slugify(productName, { lower: true, strict: true, locale: 'vi' });
      let slug = baseSlug;
      let counter = 1;

      while (await Product.exists({ 'seo.urlSlug': slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter++}`;
      }

      product.seo.urlSlug = slug;
    }

    // 6. Gán dữ liệu mới (sạch hơn Object.assign)
    if (productName) product.basicInformation.productName = productName;
    if (sku) product.basicInformation.sku = sku;
    if (basicInformation.categoryIds) product.basicInformation.categoryIds = basicInformation.categoryIds;

    product.basicInformation = { ...product.basicInformation, ...basicInformation };
    product.pricingAndInventory = { ...product.pricingAndInventory, ...pricingAndInventory };
    product.description = { ...product.description, ...description };
    product.technicalDetails = { ...product.technicalDetails, ...technicalDetails };
    product.seo = { ...product.seo, ...seo };
    product.policy = { ...product.policy, ...policy };

    // 7. Xử lý ảnh nếu có upload
    const uploadedImages = req.uploadedImages;
    if (uploadedImages?.length > 0) {
      if (uploadedImages.length > 6) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.MAX_IMAGE_COUNT_EXCEEDED);
      }

      const totalSize = uploadedImages.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 30 * 1024 * 1024) {
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.MAX_TOTAL_SIZE_EXCEEDED);
      }

      const mainImage = uploadedImages[0];
      const imageGallery = uploadedImages.slice(1);
      if (imageGallery.length === 0) imageGallery.push(mainImage);

      product.media = {
        mainImage: `/media/${mainImage._id}`,
        imageGallery: imageGallery.map(file => `/media/${file._id}`),
        videoUrl: null
      };

      product.mediaFiles.images = uploadedImages.map(file => ({
        path: `/media/${file._id}`,
        filename: file.filename,
        mimetype: file.contentType,
        size: file.size
      }));
    }

    // 8. Lưu và trả kết quả
    const savedProduct = await product.save();
    return sendSuccess(res, StatusCodes.SUCCESS_OK, { product: savedProduct }, Messages.PRODUCT_UPDATED);

  } catch (err) {
    console.error('Update Product Error:', err);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, Messages.INTERNAL_SERVER_ERROR);
  }
};


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

    worksheet.columns = [
      { header: 'ProductName', key: 'productName', width: 30 },
      { header: 'SKU', key: 'sku', width: 20 },
      { header: 'Brand', key: 'brand', width: 20 },
      { header: 'Status', key: 'status', width: 12 },
      { header: 'Origin', key: 'origin', width: 15 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'OriginalPrice', key: 'originalPrice', width: 15 },
      { header: 'Stock', key: 'stock', width: 10 },
      { header: 'Unit', key: 'unit', width: 10 },
      { header: 'ShortDescription', key: 'shortDescription', width: 40 },
      { header: 'CategoryNames', key: 'categoryNames', width: 25 },
      { header: 'CreatedAt', key: 'createdAt', width: 20 },
      { header: 'UpdatedAt', key: 'updatedAt', width: 20 }
    ];

    worksheet.getRow(1).font = { name: 'Times New Roman', bold: true };
    ['price', 'originalPrice', 'stock'].forEach(key => {
      worksheet.getColumn(key).numFmt = '#,##0';
      worksheet.getColumn(key).alignment = { horizontal: 'center' };
    });
    ['createdAt', 'updatedAt'].forEach(key => {
      worksheet.getColumn(key).alignment = { horizontal: 'center' };
    });
    worksheet.views = [{ state: 'frozen', ySplit: 1 }];

    products.forEach(p => {
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
        categoryNames: (p.basicInformation?.categoryIds || []).map(c => c?.name).join(', '),
        createdAt: formatDate(p.createdAt),
        updatedAt: formatDate(p.updatedAt)
      });
    });

    worksheet.eachRow((row, i) => {
      row.font = { name: 'Times New Roman', size: 12 };
      if (i !== 1) {
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: i % 2 === 0 ? 'FFF9F9F9' : 'FFFFFFFF' }
        };
      }
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const fileName = `products-${Date.now()}.xlsx`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('[Excel Export Error]', error);
    return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, 'Xuất Excel thất bại. Vui lòng thử lại.');
  }
};
