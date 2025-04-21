const DiscountSchema = new mongoose.Schema({
    name: String,
    percentage: Number,
    productId: String
  });
  module.exports = mongoose.model('SYS_DISCOUNT', DiscountSchema);