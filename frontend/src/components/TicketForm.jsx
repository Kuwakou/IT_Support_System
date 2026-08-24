import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';

const CATEGORIES = ['Hardware', 'Software', 'Network', 'Account', 'Other'];
const PRIORITIES = ['Low', 'Medium', 'High'];

const TicketForm = ({ onCreated, editingTicket, onUpdated, onCancelEdit }) => {
  const [formData, setFormData] = useState({ title: '', description: '', category: '', priority: 'Medium' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingTicket) {
      setFormData({
        title: editingTicket.title,
        description: editingTicket.description || '',
        category: editingTicket.category,
        priority: editingTicket.priority,
      });
    }
  }, [editingTicket]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.category) {
      setError('Title and category are required');
      return;
    }

    setSubmitting(true);
    try {
      if (editingTicket) {
        const response = await axiosInstance.put(`/api/tickets/${editingTicket._id}`, formData);
        onUpdated(response.data);
      } else {
        const response = await axiosInstance.post('/api/tickets', formData);
        onCreated(response.data);
        setFormData({ title: '', description: '', category: '', priority: 'Medium' });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save ticket.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingTicket ? 'Edit Ticket' : 'Submit a Ticket'}</h1>

      {error && (
        <div className="mb-4 p-2 rounded bg-red-100 text-red-700 text-sm">{error}</div>
      )}

      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <select
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        <option value="">Select a category</option>
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
      <select
        value={formData.priority}
        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      >
        {PRIORITIES.map((p) => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50"
      >
        {submitting ? 'Saving...' : editingTicket ? 'Update Ticket' : 'Submit Ticket'}
      </button>
      {editingTicket && (
        <button
          type="button"
          onClick={onCancelEdit}
          className="w-full mt-2 bg-gray-200 text-gray-800 p-2 rounded"
        >
          Cancel
        </button>
      )}
    </form>
  );
};

export default TicketForm;
