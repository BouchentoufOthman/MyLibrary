import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudyRoomReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'active', 'completed', 'cancelled'

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
      const response = await axios.get('/api/studyroom-reservations/all', config);
      setReservations(response.data);
    } catch (err) {
      setError('Failed to fetch reservations');
    }
  };

  const handleCancel = async (reservationId) => {
    if (!window.confirm('Cancel this reservation?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`/api/studyroom-reservations/${reservationId}/cancel`, {}, config);
      setSuccess('Reservation cancelled successfully!');
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleComplete = async (reservationId) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`/api/studyroom-reservations/${reservationId}/complete`, {}, config);
      setSuccess('Reservation completed successfully!');
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Completion failed');
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

      await axios.delete(`/api/studyroom-reservations/${reservationId}`, config);
      setSuccess('Reservation deleted successfully!');
      fetchReservations();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const filteredReservations = reservations.filter((reservation) => {
    if (filter === 'all') return true;
    return reservation.status === filter;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Study Room Reservation Management</h1>
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
            Active ({reservations.filter((r) => r.status === 'active').length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded ${
              filter === 'completed' ? 'bg-green-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Completed ({reservations.filter((r) => r.status === 'completed').length})
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-4 py-2 rounded ${
              filter === 'cancelled' ? 'bg-gray-500 text-white' : 'bg-white text-gray-700'
            }`}
          >
            Cancelled ({reservations.filter((r) => r.status === 'cancelled').length})
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
                  Study Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Purpose
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
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
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
                        {reservation.studyRoom?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        Room #{reservation.studyRoom?.roomNumber || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {new Date(reservation.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reservation.startTime} - {reservation.endTime}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600 max-w-xs truncate">
                        {reservation.purpose || '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-sm ${
                          reservation.status === 'active'
                            ? 'bg-blue-100 text-blue-800'
                            : reservation.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {reservation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {reservation.status === 'active' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleComplete(reservation._id)}
                            className="text-green-600 hover:text-green-900 text-sm"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancel(reservation._id)}
                            className="text-orange-600 hover:text-orange-900 text-sm"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(reservation._id)}
                            className="text-red-600 hover:text-red-900 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDelete(reservation._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
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

export default StudyRoomReservationManagement;