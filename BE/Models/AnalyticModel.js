const AnalyticSchema = new mongoose.Schema({
    type: String,
    value: Number,
    recordedAt: Date
  });
  module.exports = mongoose.model('SYS_ANALYTIC', AnalyticSchema);