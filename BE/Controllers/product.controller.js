  const Product = require('../Models/Products');
  const Category = require('../Models/Categories');
  const path = require('path');
  const ExcelJS = require('exceljs');
  const moment = require('moment');
  const { Parser } = require('json2csv');
  const slugify = require('slugify');
  const mongoose = require('mongoose');
  const fs = require('fs').promises;

  const { sendSuccess, sendError } = require('../Utils/responseHelper');
  const StatusCodes = require('../Constants/ResponseCode');
  const Messages = require('../Constants/ResponseMessage');

  const isValidId = id => mongoose.Types.ObjectId.isValid(id);
  const formatDate = date => new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

  const buildRegexSearch = value => new RegExp(`^${value}`, 'i');

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

      if (name) query['basicInformation.name'] = buildRegexSearch(name);
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
    try {
      const {
        basicInformation,
        pricingAndInventory,
        media,
        mediaFiles,
        description,
        technicalDetails,
        seo,
        policy,
      } = req.body;
  
      if (!basicInformation?.productName)
        return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_REQUIRED);
  
      // Check unique fields
      const [nameExists, skuExists, slugExists] = await Promise.all([
        Product.findOne({ 'basicInformation.productName': basicInformation.productName }),
        Product.findOne({ 'basicInformation.sku': basicInformation.sku }),
        Product.findOne({ 'seo.urlSlug': seo?.urlSlug }),
      ]);
  
      if (nameExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
      if (skuExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);
      if (slugExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.URLSLUG_EXISTS);
  
      // Slugify URL
      // Tự tạo slug nếu không có sẵn
        let rawSlug = seo?.urlSlug || basicInformation.productName;
        seo.urlSlug = slugify(rawSlug, { lower: true, strict: true, locale: 'vi' });

        // Đảm bảo slug là duy nhất
        let originalSlug = seo.urlSlug;
        let count = 1;
        while (await Product.findOne({ 'seo.urlSlug': seo.urlSlug })) {
          seo.urlSlug = `${originalSlug}-${count++}`;
        }

  
      const newProduct = new Product({
        basicInformation,
        pricingAndInventory,
        media,
        mediaFiles,
        description,
        technicalDetails,
        seo,
        policy,
      });
  
      const saved = await newProduct.save();
      return sendSuccess(res, StatusCodes.SUCCESS_CREATED, { product: saved }, Messages.PRODUCT_CREATED);
    } catch (err) {
      return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
    }
  };

  exports.updateProduct = async (req, res) => {
    const { id } = req.params;
    if (!isValidId(id)) {
      return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.INVALID_ID);
    }
  
    try {
      const product = await Product.findById(id);
      if (!product) return sendError(res, StatusCodes.ERROR_NOT_FOUND, Messages.PRODUCT_NOT_FOUND);
  
      const {
        basicInformation = {},
        pricingAndInventory = {},
        media = {},
        mediaFiles = {},
        description = {},
        technicalDetails = {},
        seo = {},
        policy = {},
      } = req.body;
  
      // Check unique fields
      const [nameExists, skuExists, slugExists] = await Promise.all([
        basicInformation.productName ? Product.findOne({ 'basicInformation.productName': basicInformation.productName, _id: { $ne: id } }) : null,
        basicInformation.sku ? Product.findOne({ 'basicInformation.sku': basicInformation.sku, _id: { $ne: id } }) : null,
        seo.urlSlug ? Product.findOne({ 'seo.urlSlug': seo.urlSlug, _id: { $ne: id } }) : null,
      ]);
  
      if (nameExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.PRODUCT_NAME_EXISTS);
      if (skuExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.SKU_EXISTS);
      if (slugExists) return sendError(res, StatusCodes.ERROR_BAD_REQUEST, Messages.URLSLUG_EXISTS);
  
      // Slugify if exists
      if (seo?.urlSlug || basicInformation?.productName) {
        let rawSlug = seo?.urlSlug || basicInformation.productName;
        seo.urlSlug = slugify(rawSlug, { lower: true, strict: true, locale: 'vi' });
      
        let originalSlug = seo.urlSlug;
        let count = 1;
        while (await Product.findOne({ 'seo.urlSlug': seo.urlSlug, _id: { $ne: id } })) {
          seo.urlSlug = `${originalSlug}-${count++}`;
        }
      }
      
  
      // Merge nested fields
      Object.assign(product.basicInformation, basicInformation);
      Object.assign(product.pricingAndInventory, pricingAndInventory);
      Object.assign(product.media, media);
      Object.assign(product.mediaFiles, mediaFiles);
      Object.assign(product.description, description);
      Object.assign(product.technicalDetails, technicalDetails);
      Object.assign(product.seo, seo);
      Object.assign(product.policy, policy);
  
      const updated = await product.save();
      return sendSuccess(res, StatusCodes.SUCCESS_OK, updated, Messages.PRODUCT_UPDATED);
    } catch (err) {
      return sendError(res, StatusCodes.ERROR_INTERNAL_SERVER, err.message);
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
