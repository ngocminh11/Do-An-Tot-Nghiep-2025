const TicketSchema = new mongoose.Schema({
    userId: String,
    subject: String,
    status: String
  });
  module.exports = mongoose.model('SYS_TICKET', TicketSchema);