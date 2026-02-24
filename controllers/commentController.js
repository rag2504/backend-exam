const TicketComment = require('../models/TicketComment');
const { body, validationResult } = require('express-validator');

exports.updateCommentValidation = [body('comment').trim().notEmpty()];

exports.updateComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array().map(e => e.msg).join(', ') });
    }
    const comment = await TicketComment.findById(req.params.id).populate('ticket');
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const isAuthor = comment.user.toString() === req.user._id.toString();
    if (req.user.role !== 'MANAGER' && !isAuthor) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    comment.comment = req.body.comment;
    await comment.save();
    const populated = await TicketComment.findById(comment._id).populate('user', 'name email role').lean();
    res.json(populated);
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const comment = await TicketComment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });
    const isAuthor = comment.user.toString() === req.user._id.toString();
    if (req.user.role !== 'MANAGER' && !isAuthor) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    await TicketComment.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
