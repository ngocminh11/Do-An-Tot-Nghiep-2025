const CartSchema = new mongoose.Schema({
    userId: String,
    items: Array
  });
  module.exports = mongoose.model('SYS_CART', CartSchema);