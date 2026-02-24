const Ticket = require('../models/Ticket');
const TicketComment = require('../models/TicketComment');
const TicketStatusLog = require('../models/TicketStatusLog');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');
const { isValidTransition } = require('../utils/statusTransition');

exports.createTicketValidation = [
  body('title').trim().isLength({ min: 5 }),
  body('description').trim().isLength({ min: 10 }),
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH'])
];

exports.createTicket = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    const data = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'MEDIUM',
      createdBy: req.user._id
    };
    const ticket = await Ticket.create(data);
    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

async function getTicketFilter(req) {
  if (req.user.role === 'MANAGER') return {};
  if (req.user.role === 'SUPPORT') return { assignedTo: req.user._id };
  return { createdBy: req.user._id };
}

exports.getTickets = async (req, res, next) => {
  try {
    const filter = await getTicketFilter(req);
    const tickets = await Ticket.find(filter)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })
      .lean();
    res.json(tickets);
  } catch (err) {
    next(err);
  }
};

exports.getTicketById = async (req, res, next) => {
  try {
    const filter = await getTicketFilter(req);
    const ticket = await Ticket.findOne({ _id: req.params.id, ...filter })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

async function canAccessTicket(req, ticket) {
  if (req.user.role === 'MANAGER') return true;
  if (req.user.role === 'SUPPORT' && ticket.assignedTo && ticket.assignedTo.toString() === req.user._id.toString()) return true;
  if (req.user.role === 'USER' && ticket.createdBy.toString() === req.user._id.toString()) return true;
  return false;
}

exports.assignTicketValidation = [body('assignedTo').isMongoId()];

exports.assignTicket = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Invalid assignedTo value' });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const assignee = await User.findById(req.body.assignedTo);
    if (!assignee) return res.status(404).json({ error: 'User not found' });
    if (assignee.role === 'USER') {
      return res.status(400).json({ error: 'Cannot assign ticket to USER role' });
    }
    ticket.assignedTo = req.body.assignedTo;
    await ticket.save();
    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.updateStatusValidation = [body('status').isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'])];

exports.updateTicketStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const canAccess = await canAccessTicket(req, ticket);
    if (!canAccess) return res.status(403).json({ error: 'Insufficient permissions' });
    const newStatus = req.body.status;
    if (!isValidTransition(ticket.status, newStatus)) {
      return res.status(400).json({ error: 'Invalid status transition' });
    }
    const oldStatus = ticket.status;
    ticket.status = newStatus;
    await ticket.save();
    await TicketStatusLog.create({
      ticket: ticket._id,
      oldStatus,
      newStatus,
      changedBy: req.user._id
    });
    const populated = await Ticket.findById(ticket._id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .lean();
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    await Ticket.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

exports.addCommentValidation = [body('comment').trim().notEmpty()];

exports.addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const canAccess = await canAccessTicket(req, ticket);
    if (!canAccess) return res.status(403).json({ error: 'Insufficient permissions' });
    const comment = await TicketComment.create({
      ticket: ticket._id,
      user: req.user._id,
      comment: req.body.comment
    });
    const populated = await TicketComment.findById(comment._id).populate('user', 'name email role').lean();
    res.status(201).json(populated);
  } catch (err) {
    next(err);
  }
};

exports.getComments = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const canAccess = await canAccessTicket(req, ticket);
    if (!canAccess) return res.status(403).json({ error: 'Insufficient permissions' });
    const comments = await TicketComment.find({ ticket: ticket._id })
      .populate('user', 'name email role')
      .sort({ createdAt: 1 })
      .lean();
    res.json(comments);
  } catch (err) {
    next(err);
  }
};
