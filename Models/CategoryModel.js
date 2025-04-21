const CategorySchema = new mongoose.Schema({
    name: String
  });
  module.exports = mongoose.model('SYS_CATEGORY', CategorySchema);