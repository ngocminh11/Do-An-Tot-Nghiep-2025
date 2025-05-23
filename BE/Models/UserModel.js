const UserSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String
  });
  module.exports = mongoose.model('SYS_USER', UserSchema);