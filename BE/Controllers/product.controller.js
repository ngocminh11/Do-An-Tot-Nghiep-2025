const Product = require('../Models/Products');

// Tạo sản phẩm mới, kiểm tra tồn tại theo SKU
exports.createProduct = async (req, res) => {
  try {
    const exist = await Product.findOne({ 'basicInformation.sku': req.body.basicInformation.sku });
    if (exist) return res.status(400).json({ message: 'Sản phẩm đã tồn tại' });

    const product = new Product({ 
      ...req.body, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    });

    const savedProduct = await product.save();
    res.status(201).json({
      message: 'Thêm sản phẩm thành công',
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

// Cập nhật sản phẩm theo id
exports.updateProduct = async (req, res) => {
  try {
    if (req.body.basicInformation?.sku) {
      const exist = await Product.findOne({ 
        'basicInformation.sku': req.body.basicInformation.sku, 
        _id: { $ne: req.params.id } 
      });
      if (exist) return res.status(400).json({ message: 'SKU đã được sử dụng bởi sản phẩm khác' });
    }

    const updateData = { ...req.body, updatedAt: new Date() };
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Xóa sản phẩm theo id
exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });

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

// Tìm sản phẩm theo SKU query param
exports.searchProductBySku = async (req, res) => {
  try {
    const sku = req.query.sku;
    if (!sku) return res.status(400).json({ message: 'Cần truyền sku để tìm kiếm' });

    const product = await Product.findOne({ 'basicInformation.sku': sku });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm với SKU này' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
