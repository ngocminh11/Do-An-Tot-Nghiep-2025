const Category = require('../Models/Categories');

module.exports = async function () {
  try {
    const existing = await Category.findOne({ name: 'Serum Dưỡng Da' });
    if (existing) {
      console.log('Danh mục đã tồn tại:', existing._id);
      return existing;
    }

    const category = new Category({
      name: 'Serum Dưỡng Da',
      description: 'Các loại serum chuyên sâu cho việc chăm sóc da mặt.',
      parentId: null,
      imageUrl: 'https://example.com/category_serum.jpg'
    });

    const savedCategory = await category.save();
    console.log('Danh mục đã được tạo:', savedCategory._id);
    return savedCategory;
  } catch (error) {
    console.error('Lỗi khi tạo danh mục:', error);
  }
};
