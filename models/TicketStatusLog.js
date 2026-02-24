const mongoose = require('mongoose');

const ticketStatusLogSchema = new mongoose.Schema({
  ticket: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
  oldStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TicketStatusLog', ticketStatusLogSchema);
