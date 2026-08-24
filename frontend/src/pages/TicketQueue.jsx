import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const STATUS_STYLES = {
  Open: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-700',
};

const STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const TicketQueue = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ status: '', priority: '', assignedTo: '' });

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.priority) params.priority = filters.priority;
      if (filters.assignedTo) params.assignedTo = filters.assignedTo;
      const response = await axiosInstance.get('/api/tickets', { params });
      setTickets(response.data);
    } catch (err) {
      setError('Failed to load ticket queue.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleAssignToMe = async (e, ticketId) => {
    e.preventDefault();
    e.stopPropagation();
    setError('');
    try {
      await axiosInstance.put(`/api/tickets/${ticketId}`, { assignedTo: user.id });
      fetchQueue();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign ticket.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Ticket Queue</h1>

      <div className="bg-white p-4 shadow-md rounded mb-6 flex flex-wrap gap-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={filters.priority}
          onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={filters.assignedTo}
          onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
          className="p-2 border rounded"
        >
          <option value="">All tickets</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-2 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      )}

      {loading ? (
        <p className="text-gray-500">Loading queue...</p>
      ) : tickets.length === 0 ? (
        <p className="text-gray-500">No tickets match these filters.</p>
      ) : (
        <div>
          {tickets.map((ticket) => (
            <Link
              to={`/tickets/${ticket._id}`}
              key={ticket._id}
              className="bg-white p-4 mb-4 rounded shadow flex justify-between items-start hover:shadow-md transition-shadow"
            >
              <div>
                <h2 className="font-bold">{ticket.title}</h2>
                <p className="text-sm text-gray-500">
                  Submitted by {ticket.createdBy?.name || 'Unknown'} · {ticket.category} · {ticket.priority} priority
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Created {new Date(ticket.createdAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                    STATUS_STYLES[ticket.status] || 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {ticket.status}
                </span>
                {!ticket.assignedTo && (
                  <button
                    onClick={(e) => handleAssignToMe(e, ticket._id)}
                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded whitespace-nowrap"
                  >
                    Assign to Me
                  </button>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default TicketQueue;
