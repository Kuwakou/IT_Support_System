import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import TicketForm from '../components/TicketForm';
import TicketList from '../components/TicketList';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true);
      setError('');
      try {
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

  const handleCreated = (newTicket) => {
    setTickets([newTicket, ...tickets]);
  };

  return (
    <div className="container mx-auto p-6">
      <TicketForm onCreated={handleCreated} />
      {error && (
        <div className="mb-4 p-2 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      )}
      {loading ? (
        <p className="text-gray-500">Loading tickets...</p>
      ) : (
        <TicketList tickets={tickets} />
      )}
    </div>
  );
};

export default Tickets;
