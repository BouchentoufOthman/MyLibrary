import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GuestSpeakerManagement = () => {
  const [speakers, setSpeakers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: '',
    bio: '',
    organization: '',
    photoUrl: '',
    isAvailable: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      const response = await axios.get('/api/guest-speakers');
      setSpeakers(response.data);
    } catch (err) {
      setError('Failed to fetch guest speakers');
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

      // Convert expertise string to array
      const expertiseArray = formData.expertise
        .split(',')
        .map(e => e.trim())
        .filter(e => e !== '');

      const dataToSend = {
        ...formData,
        expertise: expertiseArray,
      };

      if (editingSpeaker) {
        await axios.put(`/api/guest-speakers/${editingSpeaker._id}`, dataToSend, config);
        setSuccess('Guest speaker updated successfully!');
      } else {
        await axios.post('/api/guest-speakers', dataToSend, config);
        setSuccess('Guest speaker added successfully!');
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        expertise: '',
        bio: '',
        organization: '',
        photoUrl: '',
        isAvailable: true,
      });
      setShowForm(false);
      setEditingSpeaker(null);
      fetchSpeakers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (speaker) => {
    setEditingSpeaker(speaker);
    setFormData({
      name: speaker.name,
      email: speaker.email,
      phone: speaker.phone,
      expertise: speaker.expertise.join(', '),
      bio: speaker.bio,
      organization: speaker.organization || '',
      photoUrl: speaker.photoUrl || '',
      isAvailable: speaker.isAvailable,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guest speaker?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/guest-speakers/${id}`, config);
      setSuccess('Guest speaker deleted successfully!');
      fetchSpeakers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSpeaker(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      expertise: '',
      bio: '',
      organization: '',
      photoUrl: '',
      isAvailable: true,
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Guest Speaker Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {showForm ? 'Cancel' : 'Add New Speaker'}
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
              {editingSpeaker ? 'Edit Guest Speaker' : 'Add New Guest Speaker'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Phone *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Expertise * (comma-separated)
                  </label>
                  <input
                    type="text"
                    name="expertise"
                    value={formData.expertise}
                    onChange={handleChange}
                    placeholder="Technology, Science, Business"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Organization
                  </label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Photo URL
                  </label>
                  <input
                    type="url"
                    name="photoUrl"
                    value={formData.photoUrl}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Bio *
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                  required
                />
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
                  <span className="text-gray-700 text-sm font-medium">Available for events</span>
                </label>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingSpeaker ? 'Update Speaker' : 'Add Speaker'}
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

        {/* Speakers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {speakers.length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-8">
              No guest speakers found. Add your first speaker!
            </div>
          ) : (
            speakers.map((speaker) => (
              <div key={speaker._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    {speaker.photoUrl && (
                      <img
                        src={speaker.photoUrl}
                        alt={speaker.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{speaker.name}</h3>
                      {speaker.organization && (
                        <p className="text-sm text-gray-500">{speaker.organization}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      speaker.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {speaker.isAvailable ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <div className="mb-4">
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Email:</span> {speaker.email}
                  </p>
                  <p className="text-gray-600 text-sm mb-2">
                    <span className="font-medium">Phone:</span> {speaker.phone}
                  </p>
                  <div className="mb-2">
                    <span className="font-medium text-gray-600 text-sm">Expertise:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {speaker.expertise.map((exp, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm mt-2">{speaker.bio}</p>
                </div>

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(speaker)}
                    className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(speaker._id)}
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

export default GuestSpeakerManagement;