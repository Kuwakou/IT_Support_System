import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';
import TicketForm from '../components/TicketForm';

const STATUS_STYLES = {
  Open: 'bg-blue-100 text-blue-800',
  'In Progress': 'bg-yellow-100 text-yellow-800',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-200 text-gray-700',
};

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [commentBody, setCommentBody] = useState('');
  const [commentError, setCommentError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [ticketRes, commentsRes] = await Promise.all([
          axiosInstance.get(`/api/tickets/${id}`),
          axiosInstance.get(`/api/tickets/${id}/comments`),
        ]);
        setTicket(ticketRes.data);
        setComments(commentsRes.data);
      } catch (err) {
        if (err.response?.status === 403) {
          setError('403 Forbidden: you do not have access to this ticket.');
        } else {
          setError('Failed to load ticket.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    setCommentError('');

    if (!commentBody.trim()) {
      setCommentError('Comment cannot be empty');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axiosInstance.post(`/api/tickets/${id}/comments`, { body: commentBody });
      setComments([...comments, response.data]);
      setCommentBody('');
    } catch (err) {
      setCommentError(err.response?.data?.message || 'Failed to add comment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/api/tickets/${id}`);
      navigate('/tickets', { state: { toast: 'Ticket deleted' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete ticket.');
    }
  };

  const handleAssignToMe = async () => {
    setError('');
    try {
      const response = await axiosInstance.put(`/api/tickets/${id}`, { assignedTo: user.id });
      setTicket(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign ticket.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await axiosInstance.delete(`/api/comments/${commentId}`);
      setComments(comments.filter((c) => c._id !== commentId));
    } catch (err) {
      setCommentError('Failed to delete comment.');
    }
  };

  if (loading) {
    return <div className="container mx-auto p-6 text-gray-500">Loading ticket...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="p-4 rounded bg-red-100 text-red-700">{error}</div>
        <Link to="/tickets" className="text-blue-600 underline mt-4 inline-block">
          Back to tickets
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Link to="/tickets" className="text-blue-600 underline text-sm">
        &larr; Back to tickets
      </Link>

      {isEditing ? (
        <div className="my-4">
          <TicketForm
            editingTicket={ticket}
            onUpdated={(updated) => {
              setTicket(updated);
              setIsEditing(false);
            }}
            onCancelEdit={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <div className="bg-white p-6 shadow-md rounded my-4">
          <div className="flex justify-between items-start mb-2">
            <h1 className="text-2xl font-bold">{ticket.title}</h1>
            <span
              className={`text-xs font-semibold px-2 py-1 rounded whitespace-nowrap ${
                STATUS_STYLES[ticket.status] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {ticket.status}
            </span>
          </div>
          <p className="text-gray-700 mb-4">{ticket.description}</p>
          <p className="text-sm text-gray-500">
            {ticket.category} · {ticket.priority} priority
          </p>
          {ticket.resolutionNote && (
            <p className="text-sm text-gray-600 mt-2 italic">Resolution note: {ticket.resolutionNote}</p>
          )}
          {user?.role === 'agent' && !ticket.assignedTo && (
            <button
              onClick={handleAssignToMe}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Assign to Me
            </button>
          )}
          {user?.role !== 'agent' && ticket.createdBy === user?.id && ticket.status === 'Open' && (
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-yellow-500 text-white px-4 py-2 rounded text-sm"
              >
                Edit Ticket
              </button>
              {!ticket.assignedTo && (
                <button
                  onClick={handleDeleteTicket}
                  className="bg-red-600 text-white px-4 py-2 rounded text-sm"
                >
                  Delete Ticket
                </button>
              )}
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 shadow-md rounded">
        <h2 className="text-lg font-bold mb-4">Comments</h2>

        {comments.length === 0 && <p className="text-gray-500 text-sm mb-4">No comments yet.</p>}

        {comments.map((comment) => (
          <div key={comment._id} className="border-b py-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">
                {comment.author?.name} <span className="text-gray-400 font-normal">({comment.author?.role})</span>
              </span>
              <span className="text-xs text-gray-400">{new Date(comment.createdAt).toLocaleString()}</span>
            </div>
            <p className="text-sm mt-1">{comment.body}</p>
            {comment.author?._id === user?.id && (
              <button
                onClick={() => handleDeleteComment(comment._id)}
                className="text-xs text-red-600 mt-1"
              >
                Delete
              </button>
            )}
          </div>
        ))}

        <form onSubmit={handleAddComment} className="mt-4">
          {commentError && (
            <div className="mb-2 p-2 rounded bg-red-100 text-red-700 text-sm">{commentError}</div>
          )}
          <textarea
            placeholder="Add a comment..."
            value={commentBody}
            onChange={(e) => setCommentBody(e.target.value)}
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {submitting ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TicketDetail;
