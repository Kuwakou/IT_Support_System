const Ticket = require('../models/Ticket');

const getTickets = async (req, res) => {
  try {
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
  const { title, description, priority } = req.body;
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    if (!ticket.createdBy.equals(req.user.id)) {
      return res.status(403).json({ message: 'Not authorized to update this ticket' });
    }
    ticket.title = title || ticket.title;
    ticket.description = description || ticket.description;
    ticket.priority = priority || ticket.priority;
    const updatedTicket = await ticket.save();
    res.json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteTicket = async (req, res) => {
  try {
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
