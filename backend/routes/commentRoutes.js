
const express = require('express');
const { getComments, addComment, deleteComment } = require('../controllers/commentController');
const { protect } = require('../middleware/authMiddleware');

// mounted at /api/tickets/:ticketId/comments
const nestedRouter = express.Router({ mergeParams: true });
nestedRouter.route('/').get(protect, getComments).post(protect, addComment);

// mounted at /api/comments
const flatRouter = express.Router();
flatRouter.delete('/:id', protect, deleteComment);

module.exports = { nestedRouter, flatRouter };
