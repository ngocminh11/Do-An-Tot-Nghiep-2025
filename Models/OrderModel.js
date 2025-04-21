const OrderSchema = new mongoose.Schema({
    userId: String,
    total: Number,
    status: String,
    createdAt: Date
  });
  module.exports = mongoose.model('SYS_ORDER', OrderSchema);