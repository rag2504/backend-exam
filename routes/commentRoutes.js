const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const commentController = require('../controllers/commentController');

router.patch('/:id', auth, commentController.updateCommentValidation, commentController.updateComment);
router.delete('/:id', auth, commentController.deleteComment);

module.exports = router;
