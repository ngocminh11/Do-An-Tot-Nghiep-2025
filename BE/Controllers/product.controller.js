const Product = require('../Models/Products');
const slugify = require('slugify');
const fs = require('fs').promises;
const path = require('path');

// Hàm xử lý lỗi upload
const handleUploadError = (error, res) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ message: 'File vượt quá kích thước cho phép (30MB)' });
  }
  return res.status(400).json({ message: error.message });
};

// Hàm xóa file cũ
const deleteOldFiles = async (files) => {
  if (!files) return;

  const deletePromises = files.map(async (file) => {
    try {
      await fs.unlink(file.path);
    } catch (error) {
      console.error(`Error deleting file ${file.path}:`, error);
    }
  });

  await Promise.all(deletePromises);
};

exports.createProduct = async (req, res) => {
  try {
    const { basicInformation, idProduct, seo } = req.body;
    const files = req.files;

    // Kiểm tra trùng idProduct
    const existIdProduct = await Product.findOne({ idProduct });
    if (existIdProduct) {
      await deleteOldFiles(files);
      return res.status(400).json({ message: 'Id sản phẩm đã được sử dụng bởi sản phẩm khác' });
    }

    // Kiểm tra trùng SKU
    if (basicInformation?.sku) {
      const existSku = await Product.findOne({ 'basicInformation.sku': basicInformation.sku });
      if (existSku) {
        await deleteOldFiles(files);
        return res.status(400).json({ message: 'SKU đã được sử dụng bởi sản phẩm khác' });
      }
    }

    // Kiểm tra trùng tên sản phẩm
    if (basicInformation?.productName) {
      const existName = await Product.findOne({ 'basicInformation.productName': basicInformation.productName });
      if (existName) {
        await deleteOldFiles(files);
        return res.status(400).json({ message: 'Tên sản phẩm đã được sử dụng bởi sản phẩm khác' });
      }
    }

    // Sinh urlSlug từ productName nếu chưa có
    let urlSlug = seo?.urlSlug;
    if (!urlSlug && basicInformation?.productName) {
      urlSlug = slugify(basicInformation.productName, {
        lower: true,
        strict: true,
        locale: 'vi'
      });
    }

    // Kiểm tra trùng urlSlug
    if (urlSlug) {
      const existSlug = await Product.findOne({ 'seo.urlSlug': urlSlug });
      if (existSlug) {
        await deleteOldFiles(files);
        return res.status(400).json({ message: 'urlSlug đã được sử dụng bởi sản phẩm khác' });
      }
    }

    // Xử lý files
    const mediaFiles = {
      images: [],
      videos: []
    };

    if (files) {
      files.forEach(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'images' : 'videos';
        mediaFiles[fileType].push({
          path: file.path,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // Chuẩn bị dữ liệu lưu
    const productData = {
      ...req.body,
      mediaFiles,
      seo: {
        ...req.body.seo,
        urlSlug
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const product = new Product(productData);
    const savedProduct = await product.save();

    res.status(201).json({
      message: 'Thêm sản phẩm thành công',
      product: savedProduct
    });
  } catch (error) {
    if (req.files) {
      await deleteOldFiles(req.files);
    }
    handleUploadError(error, res);
  }
};

// Lấy sản phẩm theo id
exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { basicInformation, idProduct } = req.body;
    const { idProduct: paramIdProduct } = req.params;
    const files = req.files;

    // Tìm sản phẩm cần cập nhật
    const currentProduct = await Product.findOne({ idProduct: paramIdProduct });
    if (!currentProduct) {
      if (files) await deleteOldFiles(files);
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    // Kiểm tra trùng SKU nếu có
    if (basicInformation?.sku) {
      const existSku = await Product.findOne({
        'basicInformation.sku': basicInformation.sku,
        _id: { $ne: currentProduct._id }
      });
      if (existSku) {
        if (files) await deleteOldFiles(files);
        return res.status(400).json({ message: 'SKU đã được sử dụng bởi sản phẩm khác' });
      }
    }

    // Kiểm tra trùng tên sản phẩm nếu có
    if (basicInformation?.productName) {
      const existName = await Product.findOne({
        'basicInformation.productName': basicInformation.productName,
        _id: { $ne: currentProduct._id }
      });
      if (existName) {
        if (files) await deleteOldFiles(files);
        return res.status(400).json({ message: 'Tên sản phẩm đã được sử dụng bởi sản phẩm khác' });
      }
    }

    // Kiểm tra trùng idProduct nếu có
    if (idProduct && idProduct !== paramIdProduct) {
      const existIdProduct = await Product.findOne({
        idProduct: idProduct,
        _id: { $ne: currentProduct._id }
      });
      if (existIdProduct) {
        if (files) await deleteOldFiles(files);
        return res.status(400).json({ message: 'idProduct đã được sử dụng bởi sản phẩm khác' });
      }
    }

    // Xử lý files mới
    const mediaFiles = {
      images: [...(currentProduct.mediaFiles?.images || [])],
      videos: [...(currentProduct.mediaFiles?.videos || [])]
    };

    if (files) {
      files.forEach(file => {
        const fileType = file.mimetype.startsWith('image/') ? 'images' : 'videos';
        mediaFiles[fileType].push({
          path: file.path,
          filename: file.filename,
          mimetype: file.mimetype,
          size: file.size
        });
      });
    }

    // Cập nhật sản phẩm
    const updateData = {
      ...req.body,
      mediaFiles,
      updatedAt: new Date()
    };

    const updatedProduct = await Product.findOneAndUpdate(
      { idProduct: paramIdProduct },
      updateData,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    if (req.files) {
      await deleteOldFiles(req.files);
    }
    handleUploadError(error, res);
  }
};

// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ idProduct: req.params.idProduct });

    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }

    // Xóa các file media
    if (product.mediaFiles) {
      await deleteOldFiles([
        ...(product.mediaFiles.images || []),
        ...(product.mediaFiles.videos || [])
      ]);
    }

    // Xóa sản phẩm
    await Product.findOneAndDelete({ idProduct: req.params.idProduct });

    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lấy danh sách sản phẩm có phân trang và tìm kiếm
exports.getAllProducts = async (req, res) => {
  try {
    const {
      productName,
      minPrice,
      maxPrice,
      skinType,
      idProduct,
      page = 1,
      limit = 10
    } = req.query;
    const query = {};
    if (idProduct) {
      query.idProduct = idProduct;
    }
    if (productName) {
      query['basicInformation.productName'] = {
        $regex: productName,
        $options: 'i'
      };
    }
    if (minPrice || maxPrice) {
      query['pricingAndInventory.salePrice'] = {};
      if (minPrice) query['pricingAndInventory.salePrice'].$gte = Number(minPrice);
      if (maxPrice) query['pricingAndInventory.salePrice'].$lte = Number(maxPrice);
    }
    if (skinType) {
      query['technicalDetails.suitableSkinTypes'] = skinType;
    }
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, totalItems] = await Promise.all([
      Product.find(query).skip(skip).limit(Number(limit)),
      Product.countDocuments(query)
    ]);
    res.json({
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
      currentPage: Number(page),
      pageSize: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
