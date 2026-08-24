import { Link } from 'react-router-dom';

const STATUS_STYLES = {
  Open: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-700',
};

const TicketList = ({ tickets, onDelete }) => {
  if (tickets.length === 0) {
    return <p className="text-gray-500">No tickets yet. Submit one above to get started.</p>;
  }

  const handleDeleteClick = (e, ticketId) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this ticket? This cannot be undone.')) {
      onDelete(ticketId);
    }
  };

  return (
    <div>
      {tickets.map((ticket) => {
        const canDelete = ticket.status === 'Open' && !ticket.assignedTo;
        return (
          <Link
            to={`/tickets/${ticket._id}`}
            key={ticket._id}
            className="bg-white p-4 mb-4 rounded shadow flex justify-between items-start hover:shadow-md transition-shadow"
          >
            <div>
              <h2 className="font-bold">{ticket.title}</h2>
              <p className="text-sm text-gray-500">
                {ticket.category} · {ticket.priority} priority
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Updated {new Date(ticket.updatedAt).toLocaleString()}
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
              {canDelete && onDelete && (
                <button onClick={(e) => handleDeleteClick(e, ticket._id)} className="text-xs text-red-600">
                  Delete
                </button>
              )}
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default TicketList;
