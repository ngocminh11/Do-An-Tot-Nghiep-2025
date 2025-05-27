const Product = require('../../Models/Products');
function normalizeText(str) {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D') // Bỏ đ
    .replace(/\s+/g, '') // Bỏ khoảng trắng
    .toLowerCase();
}

// Thêm sản phẩm
exports.createProduct = async (req, res) => {
  try {
    const exist = await Product.findOne({ name: req.body.name });
    if (exist) return res.status(400).json({ message: 'Sản phẩm đã tồn tại' });

    const product = new Product({ ...req.body, createdAt: new Date(), updatedAt: new Date() });
    const savedProduct = await product.save();

    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm sản phẩm theo ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ id: req.params.id });
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tìm kiếm theo tên hoặc lấy tất cả sản phẩm
exports.getAllProducts = async (req, res) => {
  try {
    const { name } = req.query;
    let products = await Product.find(); // Lấy tất cả

    if (name) {
      const keyword = normalizeText(name);

      products = products.filter(p => {
        const normalizedName = normalizeText(p.name || '');
        return normalizedName.includes(keyword);
      });
      if (products.length === 0) {
        return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
      }
    }
    
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Cập nhật sản phẩm
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    // Kiểm tra xem sản phẩm cần cập nhật có tồn tại không
    const existingProduct = await Product.findOne({ id });
    if (!existingProduct) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
    }

    // Kiểm tra nếu tên mới trùng với sản phẩm khác
    if (name && name !== existingProduct.name) {
      const duplicate = await Product.findOne({ name, id: { $ne: id } });
      if (duplicate) {
        return res.status(400).json({ message: 'Tên sản phẩm đã tồn tại' });
      }
    }

    // Cập nhật
    const updatedProduct = await Product.findOneAndUpdate(
      { id },
      { ...req.body, updatedAt: new Date() },
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
    const deletedProduct = await Product.findOne({ id: req.params.id });
    if (!deletedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
