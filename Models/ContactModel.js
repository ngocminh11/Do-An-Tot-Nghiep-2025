const ContactSchema = new mongoose.Schema({
    userId: String,
    message: String,
    status: String
  });
  module.exports = mongoose.model('SYS_CONTACT', ContactSchema);