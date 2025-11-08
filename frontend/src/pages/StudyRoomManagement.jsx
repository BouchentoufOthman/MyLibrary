import React, { useState, useEffect } from 'react';
import axios from 'axios';

const StudyRoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    roomNumber: '',
    name: '',
    capacity: '',
    facilities: '',
    isAvailable: true,
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get('/api/studyrooms');
      setRooms(response.data);
    } catch (err) {
      setError('Failed to fetch study rooms');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ 
      ...formData, 
      [name]: type === 'checkbox' ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Convert facilities string to array
      const facilitiesArray = formData.facilities
        .split(',')
        .map(f => f.trim())
        .filter(f => f !== '');

      const dataToSend = {
        ...formData,
        facilities: facilitiesArray,
        capacity: Number(formData.capacity),
      };

      if (editingRoom) {
        await axios.put(`/api/studyrooms/${editingRoom._id}`, dataToSend, config);
        setSuccess('Study room updated successfully!');
      } else {
        await axios.post('/api/studyrooms', dataToSend, config);
        setSuccess('Study room added successfully!');
      }

      setFormData({
        roomNumber: '',
        name: '',
        capacity: '',
        facilities: '',
        isAvailable: true,
        description: '',
      });
      setShowForm(false);
      setEditingRoom(null);
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      name: room.name,
      capacity: room.capacity,
      facilities: room.facilities.join(', '),
      isAvailable: room.isAvailable,
      description: room.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this study room?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/studyrooms/${id}`, config);
      setSuccess('Study room deleted successfully!');
      fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingRoom(null);
    setFormData({
      roomNumber: '',
      name: '',
      capacity: '',
      facilities: '',
      isAvailable: true,
      description: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Study Room Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {showForm ? 'Cancel' : 'Add New Room'}
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

        {showForm && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-2xl font-bold mb-4">
              {editingRoom ? 'Edit Study Room' : 'Add New Study Room'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Room Number *
                  </label>
                  <input
                    type="text"
                    name="roomNumber"
                    value={formData.roomNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="e.g., R101"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Room Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="e.g., Study Room A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Number of people"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Facilities
                  </label>
                  <input
                    type="text"
                    name="facilities"
                    value={formData.facilities}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="Projector, Whiteboard, Computer (comma-separated)"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-gray-700 text-sm font-medium">Available for booking</span>
                </label>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="Additional details about the room"
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingRoom ? 'Update Room' : 'Add Room'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No study rooms found. Add your first room!
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
                    <p className="text-sm text-gray-500">Room #{room.roomNumber}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      room.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {room.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Capacity:</span> {room.capacity} people
                  </p>
                  {room.facilities.length > 0 && (
                    <div className="mb-2">
                      <span className="font-medium text-gray-600">Facilities:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {room.facilities.map((facility, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {facility}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {room.description && (
                    <p className="text-gray-600 text-sm mt-2">{room.description}</p>
                  )}
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(room)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudyRoomManagement;