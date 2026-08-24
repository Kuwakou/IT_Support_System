const Ticket = require('../models/Ticket');
const Comment = require('../models/Comment');

const STATUS_ORDER = ['Open', 'In Progress', 'Resolved', 'Closed'];
const VALID_CATEGORIES = ['Hardware', 'Software', 'Network', 'Account', 'Other'];

const getTickets = async (req, res) => {
  try {
    if (req.user.role === 'agent') {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.priority) filter.priority = req.query.priority;
      if (req.query.assignedTo === 'unassigned') {
        filter.assignedTo = null;
      } else if (req.query.assignedTo) {
        filter.assignedTo = req.query.assignedTo;
      }
      const tickets = await Ticket.find(filter).populate('createdBy', 'name email');
      return res.json(tickets);
    }
    const tickets = await Ticket.find({ createdBy: req.user.id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (req.user.role !== 'agent' && !ticket.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to view this ticket' });
    }
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTicket = async (req, res) => {
  const { title, description, category, priority } = req.body;
  try {
    if (!title || !category) {
      return res.status(400).json({ message: 'Title and category are required' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
    }
    const ticket = await Ticket.create({ createdBy: req.user.id, title, description, category, priority });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTicket = async (req, res) => {
  const { title, description, category, priority, status, assignedTo, resolutionNote } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const originalStatus = ticket.status;

    if (req.user.role === 'agent') {
      if (title !== undefined || description !== undefined || category !== undefined || priority !== undefined) {
        return res.status(403).json({ message: 'Agents cannot edit ticket content' });
      }

      if (assignedTo !== undefined) {
        if (assignedTo !== req.user.id) {
          return res.status(403).json({ message: 'Agents can only assign tickets to themselves' });
        }
        ticket.assignedTo = req.user.id;
      }

      if (status !== undefined && status !== originalStatus) {
        const currentIndex = STATUS_ORDER.indexOf(originalStatus);
        const nextIndex = STATUS_ORDER.indexOf(status);
        if (nextIndex !== currentIndex + 1) {
          return res.status(400).json({ message: `Cannot move status from ${originalStatus} to ${status}` });
        }
        if ((status === 'Resolved' || status === 'Closed') && !(resolutionNote || ticket.resolutionNote)) {
          return res.status(400).json({ message: 'A resolution note is required to resolve or close a ticket' });
        }
        ticket.status = status;
      }

      if (resolutionNote !== undefined) {
        ticket.resolutionNote = resolutionNote;
      }
    } else {
      if (!ticket.createdBy.equals(req.user.id)) {
        return res.status(403).json({ message: 'Not authorized to update this ticket' });
      }

      if (assignedTo !== undefined) {
        return res.status(403).json({ message: 'Only agents can assign tickets' });
      }

      if (status !== undefined && status !== originalStatus) {
        if (!(originalStatus === 'Resolved' && status === 'Open')) {
          return res.status(403).json({ message: 'Users may only reopen a Resolved ticket' });
        }
        ticket.status = 'Open';
      }

      if (title !== undefined || description !== undefined || category !== undefined || priority !== undefined) {
        if (originalStatus !== 'Open') {
          return res.status(403).json({ message: 'Ticket can only be edited while Open' });
        }
        if (category !== undefined && !VALID_CATEGORIES.includes(category)) {
          return res.status(400).json({ message: `Category must be one of: ${VALID_CATEGORIES.join(', ')}` });
        }
        ticket.title = title || ticket.title;
        ticket.description = description || ticket.description;
        ticket.category = category || ticket.category;
        ticket.priority = priority || ticket.priority;
      }
    }

    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
    if (req.user.role === 'agent') {
      return res.status(403).json({ message: 'Agents cannot delete tickets' });
    }
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (!ticket.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to delete this ticket' });
    }
    if (ticket.status !== 'Open' || ticket.assignedTo) {
      return res.status(403).json({ message: 'Ticket can only be deleted while Open and unassigned' });
    }
    await Comment.deleteMany({ ticket: ticket._id });
    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTickets, getTicket, addTicket, updateTicket, deleteTicket };
