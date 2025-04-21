const BrandSchema = new mongoose.Schema({
    name: String
  });
  module.exports = mongoose.model('SYS_BRAND', BrandSchema);