const ConfigSchema = new mongoose.Schema({
    key: String,
    value: String
  });
  module.exports = mongoose.model('SYS_CONFIG', ConfigSchema);