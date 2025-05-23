const OrderItemSchema = new mongoose.Schema({
    orderId: String,
    productId: String,
    quantity: Number,
    price: Number
  });
  module.exports = mongoose.model('SYS_ORDER_ITEM', OrderItemSchema);