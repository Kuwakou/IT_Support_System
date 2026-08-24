
const express = require('express');
const { getTickets, addTicket, updateTicket, deleteTicket } = require('../controllers/ticketController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getTickets).post(protect, addTicket);
router.route('/:id').put(protect, updateTicket).delete(protect, deleteTicket);

module.exports = router;
