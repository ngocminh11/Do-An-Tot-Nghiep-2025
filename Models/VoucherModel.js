const VoucherSchema = new mongoose.Schema({
    code: String,
    discount: Number,
    userId: String
  });
  module.exports = mongoose.model('SYS_VOUCHER', VoucherSchema);