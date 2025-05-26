const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  brand: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  price: mongoose.Schema.Types.Decimal128,
  stockQuantity: Number,
  attributes: {
    volume: String,
    skinType: [String],
  },
  imageUrls: [String],
  viewCount: Number,
  purchaseCount: Number,
  averageRating: mongoose.Schema.Types.Decimal128,
  tags: [String],
  status: { type: String, enum: ['published', 'draft', 'archived'] },
  createdAt: Date,
  updatedAt: Date
});

module.exports = mongoose.model('Product', ProductSchema);
