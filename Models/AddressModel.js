const AddressSchema = new mongoose.Schema({
    userId: String,
    address: String,
    city: String,
    district: String,
    ward: String
  });
  module.exports = mongoose.model('SYS_ADDRESS', AddressSchema);