const ProductDetailSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'SYS_PRODUCT' },
    ingredients: String,
    usage: String,
    note: String
  });
  module.exports = mongoose.model('SYS_PRODUCT_DETAIL', ProductDetailSchema);
  