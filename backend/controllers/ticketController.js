const Ticket = require('../models/Ticket');

const STATUS_ORDER = ['Open', 'In Progress', 'Resolved', 'Closed'];

const getTickets = async (req, res) => {
  try {
    if (req.user.role === 'agent') {
      const filter = {};
      if (req.query.status) filter.status = req.query.status;
      if (req.query.priority) filter.priority = req.query.priority;
      if (req.query.assignedTo) filter.assignedTo = req.query.assignedTo;
      const tickets = await Ticket.find(filter);
      return res.json(tickets);
    }
    const tickets = await Ticket.find({ createdBy: req.user.id });
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addTicket = async (req, res) => {
  const { title, description, priority } = req.body;
  try {
    const ticket = await Ticket.create({ createdBy: req.user.id, title, description, priority });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateTicket = async (req, res) => {
  const { title, description, priority, status, assignedTo, resolutionNote } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    const originalStatus = ticket.status;

    if (req.user.role === 'agent') {
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

      if (title !== undefined || description !== undefined || priority !== undefined) {
        if (originalStatus !== 'Open') {
          return res.status(403).json({ message: 'Ticket can only be edited while Open' });
        }
        ticket.title = title || ticket.title;
        ticket.description = description || ticket.description;
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
    await ticket.deleteOne();
    res.json({ message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getTickets, addTicket, updateTicket, deleteTicket };
