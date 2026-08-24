const Comment = require('../models/Comment');
const Ticket = require('../models/Ticket');

const canAccessTicket = (ticket, user) => user.role === 'agent' || ticket.createdBy.equals(user.id);

const getComments = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to view comments on this ticket' });
    }
    const comments = await Comment.find({ ticket: ticket._id })
      .sort({ createdAt: 1 })
      .populate('author', 'name role');
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addComment = async (req, res) => {
  const { body } = req.body;
  try {
    if (!body) {
      return res.status(400).json({ message: 'Comment body is required' });
    }
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (!canAccessTicket(ticket, req.user)) {
      return res.status(403).json({ message: 'Not authorized to comment on this ticket' });
    }
    const comment = await Comment.create({ ticket: ticket._id, author: req.user.id, body });
    await comment.populate('author', 'name role');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (!comment.author.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this comment' });
    }
    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getComments, addComment, deleteComment };
