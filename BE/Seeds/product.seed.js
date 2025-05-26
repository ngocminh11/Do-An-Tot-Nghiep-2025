const Product = require('../Models/Products');
const Category = require('../Models/Categories');

module.exports = async function () {
  const category = await Category.findOne({ name: 'Serum Dưỡng Da' });
  if (!category) throw new Error('Không tìm thấy danh mục để liên kết sản phẩm');

  // Kiểm tra sản phẩm đã tồn tại chưa
  const existingProduct = await Product.findOne({ name: 'Serum Vitamin C Chống Lão Hóa' });
  if (existingProduct) {
    console.log('Sản phẩm đã tồn tại, không thêm lại:', existingProduct._id);
    return existingProduct;
  }

  const product = new Product({
    name: 'Serum Vitamin C Chống Lão Hóa',
    description: 'Serum Vitamin C giúp làm sáng da, mờ thâm và chống lão hóa hiệu quả.',
    brand: 'The Ordinary',
    categoryId: category._id,
    price: 250000.00,
    stockQuantity: 50,
    attributes: {
      volume: '30ml',
      skinType: ['da dầu', 'da hỗn hợp', 'da thường']
    },
    imageUrls: [
      'https://example.com/image1.jpg',
      'https://example.com/image2.jpg'
    ],
    viewCount: 1200,
    purchaseCount: 300,
    averageRating: 4.8,
    tags: ['vitamin c', 'serum', 'chống lão hóa'],
    status: 'published',
    createdAt: new Date('2025-05-20T10:00:00Z'),
    updatedAt: new Date('2025-05-21T11:00:00Z')
  });

  await product.save();
  console.log('Sản phẩm đã được thêm');
};
