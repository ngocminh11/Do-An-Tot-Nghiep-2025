const UserRoleSchema = new mongoose.Schema({
    userId: String,
    role: String
  });
  module.exports = mongoose.model('SYS_USER_ROLE', UserRoleSchema);