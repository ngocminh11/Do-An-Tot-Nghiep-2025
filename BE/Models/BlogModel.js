const BlogSchema = new mongoose.Schema({
    title: String,
    content: String,
    authorId: String,
    createdAt: Date
  });
  module.exports = mongoose.model('SYS_BLOG', BlogSchema);