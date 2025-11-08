import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ShelfManagement = () => {
  const [shelves, setShelves] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingShelf, setEditingShelf] = useState(null);
  const [formData, setFormData] = useState({
    shelfNumber: '',
    location: '',
    section: '',
    capacity: 50,
    description: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchShelves();
  }, []);

  const fetchShelves = async () => {
    try {
      const response = await axios.get('/api/shelves');
      setShelves(response.data);
    } catch (err) {
      setError('Failed to fetch shelves');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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

      if (editingShelf) {
        await axios.put(`/api/shelves/${editingShelf._id}`, formData, config);
        setSuccess('Shelf updated successfully!');
      } else {
        await axios.post('/api/shelves', formData, config);
        setSuccess('Shelf added successfully!');
      }

      setFormData({
        shelfNumber: '',
        location: '',
        section: '',
        capacity: 50,
        description: '',
      });
      setShowForm(false);
      setEditingShelf(null);
      fetchShelves();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (shelf) => {
    setEditingShelf(shelf);
    setFormData({
      shelfNumber: shelf.shelfNumber,
      location: shelf.location,
      section: shelf.section,
      capacity: shelf.capacity,
      description: shelf.description || '',
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this shelf?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/shelves/${id}`, config);
      setSuccess('Shelf deleted successfully!');
      fetchShelves();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingShelf(null);
    setFormData({
      shelfNumber: '',
      location: '',
      section: '',
      capacity: 50,
      description: '',
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Shelf Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {showForm ? 'Cancel' : 'Add New Shelf'}
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
              {editingShelf ? 'Edit Shelf' : 'Add New Shelf'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Shelf Number *
                  </label>
                  <input
                    type="text"
                    name="shelfNumber"
                    value={formData.shelfNumber}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="e.g., A1, B2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Location *
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="e.g., First Floor, Wing A"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Section *
                  </label>
                  <input
                    type="text"
                    name="section"
                    value={formData.section}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    placeholder="e.g., Fiction, Science, History"
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
                    required
                  />
                </div>
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
                />
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingShelf ? 'Update Shelf' : 'Add Shelf'}
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

        {/* Shelves Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Shelf Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Section
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Capacity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Current Books
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {shelves.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    No shelves found. Add your first shelf!
                  </td>
                </tr>
              ) : (
                shelves.map((shelf) => (
                  <tr key={shelf._id}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {shelf.shelfNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{shelf.location}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{shelf.section}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{shelf.capacity}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded ${
                          shelf.currentBooks >= shelf.capacity
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {shelf.currentBooks}/{shelf.capacity}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleEdit(shelf)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(shelf._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
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

export default ShelfManagement;