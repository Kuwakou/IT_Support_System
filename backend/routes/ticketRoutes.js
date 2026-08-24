
const express = require('express');
const { getTickets, getTicket, addTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTickets).post(protect, addTicket);
router.route('/:id').get(protect, getTicket).put(protect, updateTicket).delete(protect, deleteTicket);

module.exports = router;
