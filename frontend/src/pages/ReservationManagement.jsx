import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'returned', 'overdue'

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/reservations/all', config);
      setReservations(response.data);
    } catch (err) {
      setError('Failed to fetch reservations');
    }
  };

  const handleReturn = async (reservationId) => {
    if (!window.confirm('Mark this reservation as returned?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`/api/reservations/${reservationId}/return`, {}, config);
      setSuccess('Book returned successfully!');
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Return failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/reservations/${reservationId}`, config);
      setSuccess('Reservation deleted successfully!');
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUpdateOverdue = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const response = await axios.put('/api/reservations/update-overdue', {}, config);
      setSuccess(`${response.data.updatedCount} reservations marked as overdue`);
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update overdue reservations');
      setTimeout(() => setError(''), 3000);
    }
  };

  const isOverdue = (dueDate, status) => {
    return status === 'active' && new Date(dueDate) < new Date();
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return isOverdue(reservation.dueDate, reservation.status);
    return reservation.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Reservation Management</h1>
          <button
            onClick={handleUpdateOverdue}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600"
          >
            Update Overdue Status
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        {/* Filter Buttons */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded ${
              filter === 'all' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            All ({reservations.length})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded ${
              filter === 'active' ? 'bg-blue-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Active ({reservations.filter((r) => r.status === 'active' && !isOverdue(r.dueDate, r.status)).length})
          </button>
          <button
            onClick={() => setFilter('overdue')}
            className={`px-4 py-2 rounded ${
              filter === 'overdue' ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Overdue ({reservations.filter((r) => isOverdue(r.dueDate, r.status)).length})
          </button>
          <button
            onClick={() => setFilter('returned')}
            className={`px-4 py-2 rounded ${
              filter === 'returned' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Returned ({reservations.filter((r) => r.status === 'returned').length})
          </button>
        </div>

        {/* Reservations Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Reserved Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReservations.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No reservations found
                  </td>
                </tr>
              ) : (
                filteredReservations.map((reservation) => (
                  <tr key={reservation._id}>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {reservation.user?.username || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.user?.email || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {reservation.book?.title || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {reservation.book?.author || 'Unknown'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(reservation.reservationDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={
                          isOverdue(reservation.dueDate, reservation.status)
                            ? 'text-red-600 font-semibold'
                            : ''
                        }
                      >
                        {new Date(reservation.dueDate).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          reservation.status === 'active'
                            ? isOverdue(reservation.dueDate, reservation.status)
                              ? 'bg-red-100 text-red-800'
                              : 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {isOverdue(reservation.dueDate, reservation.status)
                          ? 'Overdue'
                          : reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reservation.status === 'active' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReturn(reservation._id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Return
                          </button>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                            </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <span className="text-gray-500 text-sm">
                            Returned {new Date(reservation.returnDate).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReservationManagement;