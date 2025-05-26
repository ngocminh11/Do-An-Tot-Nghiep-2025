const Product = require('../Models/Products');

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

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Không tìm thấy sản phẩm' });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updateData = { ...req.body, updatedAt: new Date() };
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });

    if (!updatedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để cập nhật' });
    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct) return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa' });

    res.json({ message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
