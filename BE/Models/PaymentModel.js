const PaymentSchema = new mongoose.Schema({
    orderId: String,
    method: String,
    status: String,
    paidAt: Date
  });
  module.exports = mongoose.model('SYS_PAYMENT', PaymentSchema);