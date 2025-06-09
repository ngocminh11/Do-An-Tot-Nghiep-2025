const Category = require('../Models/Categories');
const Product = require('../Models/Products');
const slugify = require('slugify');

// GET all
exports.getAllCategories = async (req, res) => {
  try {
    const { id, name, slug, page = 1, limit = 10 } = req.query;

    const query = {};

    if (id) {
      query.idCategory = { $regex: id, $options: 'i' };
    }

    if (name) {
      query.name = { $regex: name, $options: 'i' };
    }

    if (slug) {
      query.slug = { $regex: slug, $options: 'i' };
    }

    const skip = (page - 1) * limit;

    const [categories, totalItems] = await Promise.all([
      Category.find(query)
        .sort({ createdAt: -1 }) // Sắp xếp mới nhất
        .skip(Number(skip))
        .limit(Number(limit)),
      Category.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalItems / limit);

    res.json({
      data: categories,
      currentPage: Number(page),
      totalPages,
      totalItems,
      perPage: Number(limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



exports.createCategory = async (req, res) => {
  try {
    let { idCategory, name, description, slug, status } = req.body;

    // Tự động tạo slug từ name nếu không có
    if (!slug && name) {
      slug = slugify(name, { lower: true, strict: true });
    }

    // Kiểm tra trùng từng trường
    const [idExists, nameExists, slugExists] = await Promise.all([
      Category.findOne({ idCategory }),
      Category.findOne({ name }),
      Category.findOne({ slug })
    ]);

    if (idExists) {
      return res.status(400).json({ message: 'ID danh mục đã được sử dụng.' });
    }

    if (nameExists) {
      return res.status(400).json({ message: 'Tên danh mục đã được sử dụng.' });
    }

    if (slugExists) {
      return res.status(400).json({ message: 'Slug danh mục đã được sử dụng.' });
    }

    const newCategory = new Category({
      idCategory,
      name,
      description,
      slug,
      status
    });

    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật danh mục
exports.updateCategory = async (req, res) => {
  try {
    const { idCategory } = req.params;
    const { name, slug, description, status } = req.body;

    // Tìm danh mục cần cập nhật
    const category = await Category.findOne({ idCategory });
    if (!category) {
      return res.status(404).json({ message: 'Không tìm thấy danh mục.' });
    }

    // Kiểm tra trùng name hoặc slug với danh mục khác
    const [nameConflict, slugConflict] = await Promise.all([
      name ? Category.findOne({ name, idCategory: { $ne: idCategory } }) : null,
      slug ? Category.findOne({ slug, idCategory: { $ne: idCategory } }) : null
    ]);

    if (nameConflict) {
      return res.status(400).json({ message: 'Tên danh mục đã được sử dụng.' });
    }

    if (slugConflict) {
      return res.status(400).json({ message: 'Slug danh mục đã được sử dụng.' });
    }

    // Cập nhật
    category.name = name || category.name;
    category.slug = slug || category.slug;
    category.description = description || category.description;
    category.status = status || category.status;
    category.updatedAt = new Date();

    const updatedCategory = await category.save();
    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



// Xóa danh mục
exports.deleteCategory = async (req, res) => {
  try {
    const { idCategory } = req.params;

    // Tìm tất cả sản phẩm chứa category này
    const affectedProducts = await Product.find({ categories: idCategory });

    for (const product of affectedProducts) {
      // Xóa category khỏi danh sách
      product.categories = product.categories.filter(catId => catId !== idCategory);

      // Nếu không còn category nào thì set status = 'inactive'
      if (product.categories.length === 0) {
        product.status = 'inactive';
      }

      await product.save();
    }

    const deleted = await Category.findOneAndDelete({ idCategory });

    if (!deleted) {
      return res.status(404).json({ message: 'Danh mục không tìm thấy' });
    }

    res.json({ message: 'Xóa danh mục thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};