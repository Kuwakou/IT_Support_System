import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';

const Tickets = () => {
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(location.state?.toast || '');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      try {
        // Use the axiosInstance to make the GET request to the backend
        const response = await axiosInstance.get('/api/tickets');
        setTickets(response.data);
      } catch (err) {
        setError('Failed to load tickets.');
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const handleCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  const handleDelete = async (ticketId) => {
    try {
      await axiosInstance.delete(`/api/tickets/${ticketId}`);
      setTickets(tickets.filter((t) => t._id !== ticketId));
      setToast('Ticket deleted');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      {toast && (
        <div className="mb-4 p-2 rounded bg-green-100 text-green-700 text-sm">{toast}</div>
      )}
      <TicketForm onCreated={handleCreated} />
      {error && (
        <div className="mb-4 p-2 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      )}
      {loading ? (
        <p className="text-gray-500">Loading tickets...</p>
      ) : (
        <TicketList tickets={tickets} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default Tickets;
