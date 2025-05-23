const CartItemSchema = new mongoose.Schema({
    cartId: String,
    productId: String,
    quantity: Number
  });
  module.exports = mongoose.model('SYS_CART_ITEM', CartItemSchema);