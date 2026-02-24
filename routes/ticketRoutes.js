const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const { requireRoles } = require('../middlewares/roleCheck');
const ticketController = require('../controllers/ticketController');
const commentController = require('../controllers/commentController');

router.post('/', auth, requireRoles('USER', 'MANAGER'), ticketController.createTicketValidation, ticketController.createTicket);
router.get('/', auth, ticketController.getTickets);
router.get('/:id', auth, ticketController.getTicketById);
router.patch('/:id/assign', auth, requireRoles('MANAGER', 'SUPPORT'), ticketController.assignTicketValidation, ticketController.assignTicket);
router.patch('/:id/status', auth, requireRoles('MANAGER', 'SUPPORT'), ticketController.updateStatusValidation, ticketController.updateTicketStatus);
router.delete('/:id', auth, requireRoles('MANAGER'), ticketController.deleteTicket);
router.post('/:id/comments', auth, ticketController.addCommentValidation, ticketController.addComment);
router.get('/:id/comments', auth, ticketController.getComments);

module.exports = router;
