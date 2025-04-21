const BannerSchema = new mongoose.Schema({
    title: String,
    image: String,
    active: Boolean
  });
  module.exports = mongoose.model('SYS_BANNER', BannerSchema);