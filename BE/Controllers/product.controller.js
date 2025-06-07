const Product = require('../Models/Products');
const slugify = require('slugify');

exports.createProduct = async (req, res) => {
  try {
    const { basicInformation, idProduct, seo } = req.body;

    // Kiểm tra trùng idProduct
    const existIdProduct = await Product.findOne({ idProduct });
    if (existIdProduct) {
      return res.status(400).json({ message: 'Id sản phẩm đã được sử dụng bởi sản phẩm khác' });
    }

    // Kiểm tra trùng SKU
    if (basicInformation?.sku) {
      const existSku = await Product.findOne({ 'basicInformation.sku': basicInformation.sku });
      if (existSku) return res.status(400).json({ message: 'SKU đã được sử dụng bởi sản phẩm khác' });
    }

    // Kiểm tra trùng tên sản phẩm
    if (basicInformation?.productName) {
      const existName = await Product.findOne({ 'basicInformation.productName': basicInformation.productName });
      if (existName) return res.status(400).json({ message: 'Tên sản phẩm đã được sử dụng bởi sản phẩm khác' });
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
      if (existSlug) return res.status(400).json({ message: 'urlSlug đã được sử dụng bởi sản phẩm khác' });
    }

    // Chuẩn bị dữ liệu lưu
    const productData = {
      ...req.body,
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
    res.status(500).json({ message: error.message });
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

    // Tìm sản phẩm cần cập nhật
    const currentProduct = await Product.findOne({ idProduct: paramIdProduct });
    if (!currentProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    }

    // Kiểm tra trùng SKU nếu có
    if (basicInformation?.sku) {
      const existSku = await Product.findOne({
        'basicInformation.sku': basicInformation.sku,
        _id: { $ne: currentProduct._id }
      });
      if (existSku) return res.status(400).json({ message: 'SKU đã được sử dụng bởi sản phẩm khác' });
    }

    // Kiểm tra trùng tên sản phẩm nếu có
    if (basicInformation?.productName) {
      const existName = await Product.findOne({
        'basicInformation.productName': basicInformation.productName,
        _id: { $ne: currentProduct._id }
      });
      if (existName) return res.status(400).json({ message: 'Tên sản phẩm đã được sử dụng bởi sản phẩm khác' });
    }

    // Kiểm tra trùng idProduct nếu có (và người dùng muốn đổi idProduct)
    if (idProduct && idProduct !== paramIdProduct) {
      const existIdProduct = await Product.findOne({
        idProduct: idProduct,
        _id: { $ne: currentProduct._id }
      });
      if (existIdProduct) return res.status(400).json({ message: 'idProduct đã được sử dụng bởi sản phẩm khác' });
    }

    // Cập nhật sản phẩm
    const updateData = { ...req.body, updatedAt: new Date() };

    const updatedProduct = await Product.findOneAndUpdate(
      { idProduct: paramIdProduct },
      updateData,
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findOneAndDelete({ idProduct: req.params.idProduct });

    if (!deletedProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });
    }

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
