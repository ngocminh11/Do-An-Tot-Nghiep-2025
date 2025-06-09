const Category = require('../Models/Categories');
const mongoose = require('mongoose');

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        // Nếu có provision parentCategory thì kiểm tra sự tồn tại của nó
        const { parentCategory } = req.body;
        if (parentCategory && !mongoose.Types.ObjectId.isValid(parentCategory)) {
            return res.status(400).json({ success: false, message: 'Parent category không hợp lệ' });
        }
        if (parentCategory) {
            const parentCat = await Category.findById(parentCategory);
            if (!parentCat) {
                return res.status(404).json({ success: false, message: 'Parent category không tồn tại' });
            }
        }

        const category = new Category(req.body);
        const savedCategory = await category.save();
        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: savedCategory
        });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all categories with optional filtering, searching, and pagination
exports.getAllCategories = async (req, res) => {
    try {
        let query = {};
        // Lọc theo trạng thái nếu được truyền vào
        if (req.query.status) {
            query.status = req.query.status;
        }
        // Lọc theo danh mục cha nếu có
        if (req.query.parentCategory) {
            query.parentCategory = req.query.parentCategory;
        }
        // Cho phép tìm kiếm theo tên danh mục
        if (req.query.search) {
            query.name = { $regex: req.query.search, $options: 'i' };
        }

        // Xử lý phân trang và sắp xếp theo thứ tự hiển thị (position)
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 100;
        const skip = (page - 1) * limit;
        const sort = { position: 1 };

        const [categories, totalItems] = await Promise.all([
            Category.find(query)
                .sort(sort)
                .skip(skip)
                .limit(limit)
                .populate('parentCategory'),
            Category.countDocuments(query)
        ]);

        res.json({
            success: true,
            message: 'Categories fetched successfully',
            data: categories,
            meta: {
                total: totalItems,
                page,
                pages: Math.ceil(totalItems / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get a single category by ID
exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id).populate('parentCategory');
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        // Nếu có cập nhật parentCategory, hãy kiểm tra tính hợp lệ của nó
        const { parentCategory } = req.body;
        if (parentCategory && !mongoose.Types.ObjectId.isValid(parentCategory)) {
            return res.status(400).json({ success: false, message: 'Parent category không hợp lệ' });
        }
        if (parentCategory) {
            const parentCat = await Category.findById(parentCategory);
            if (!parentCat) {
                return res.status(404).json({ success: false, message: 'Parent category không tồn tại' });
            }
        }

        // Sử dụng runValidators: true để bảo đảm các quy tắc validate của Schema được áp dụng
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated successfully', data: category });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// delete 
exports.deleteCategory = async (req, res) => {
    try {
      // Tìm danh mục cần xóa theo ID
      const category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Category not found' });
      }
  
      // 1. Cập nhật các sản phẩm chỉ có duy nhất danh mục đó:
      // Nếu trường categories của sản phẩm chỉ có 1 phần tử (là ID của danh mục cần xóa)
      // thì cập nhật trạng thái của sản phẩm thành "hidden"
      await Product.updateMany(
        {
          categories: category._id,
          $expr: { $eq: [{ $size: "$categories" }, 1] }
        },
        { $set: { status: 'hidden' } }
      );
  
      await Product.updateMany(
        {
          categories: category._id,
          $expr: { $gt: [{ $size: "$categories" }, 1] }
        },
        { $pull: { categories: category._id } }
      );
  
      await Category.findByIdAndDelete(req.params.id);
  
      res.json({ 
        success: true, 
        message: 'Category deleted successfully. Associated products updated accordingly.' 
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
  