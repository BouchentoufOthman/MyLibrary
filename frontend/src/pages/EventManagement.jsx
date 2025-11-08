import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    guestSpeakerId: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxAttendees: 50,
    category: '',
    status: 'upcoming',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEvents();
    fetchSpeakers();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      setEvents(response.data);
    } catch (err) {
      setError('Failed to fetch events');
    }
  };

  const fetchSpeakers = async () => {
    try {
      const response = await axios.get('/api/guest-speakers');
      setSpeakers(response.data.filter(speaker => speaker.isAvailable));
    } catch (err) {
      console.error('Failed to fetch speakers');
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

      if (editingEvent) {
        await axios.put(`/api/events/${editingEvent._id}`, formData, config);
        setSuccess('Event updated successfully!');
      } else {
        await axios.post('/api/events', formData, config);
        setSuccess('Event created successfully!');
      }

      setFormData({
        title: '',
        description: '',
        guestSpeakerId: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        maxAttendees: 50,
        category: '',
        status: 'upcoming',
      });
      setShowForm(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      guestSpeakerId: event.guestSpeaker._id,
      date: new Date(event.date).toISOString().split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      maxAttendees: event.maxAttendees,
      category: event.category,
      status: event.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.delete(`/api/events/${id}`, config);
      setSuccess('Event deleted successfully!');
      fetchEvents();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      guestSpeakerId: '',
      date: '',
      startTime: '',
      endTime: '',
      location: '',
      maxAttendees: 50,
      category: '',
      status: 'upcoming',
    });
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Event Management</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            {showForm ? 'Cancel' : 'Create New Event'}
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
              {editingEvent ? 'Edit Event' : 'Create New Event'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="4"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Guest Speaker *
                  </label>
                  <select
                    name="guestSpeakerId"
                    value={formData.guestSpeakerId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  >
                    <option value="">Select a speaker</option>
                    {speakers.map((speaker) => (
                      <option key={speaker._id} value={speaker._id}>
                        {speaker.name} - {speaker.expertise.join(', ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  >
                    <option value="">Select category</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Lecture">Lecture</option>
                    <option value="Conference">Conference</option>
                    <option value="Panel Discussion">Panel Discussion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    min={getTodayDate()}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
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
                    placeholder="e.g., Main Hall, Room 101"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Max Attendees *
                  </label>
                  <input
                    type="number"
                    name="maxAttendees"
                    value={formData.maxAttendees}
                    onChange={handleChange}
                    min="1"
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-4 mt-6">
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
                >
                  {editingEvent ? 'Update Event' : 'Create Event'}
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

        {/* Events List */}
        <div className="grid grid-cols-1 gap-6">
          {events.length === 0 ? (
            <div className="text-center text-gray-500 py-8 bg-white rounded-lg shadow">
              No events found. Create your first event!
            </div>
          ) : (
            events.map((event) => (
              <div key={event._id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">{event.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">{event.category}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          event.status === 'upcoming'
                            ? 'bg-blue-100 text-blue-800'
                            : event.status === 'ongoing'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'completed'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Guest Speaker:</span> {event.guestSpeaker?.name}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Date:</span>{' '}
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Time:</span> {event.startTime} - {event.endTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Location:</span> {event.location}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Attendees:</span>{' '}
                      <span
                        className={`${
                          event.currentAttendees >= event.maxAttendees
                            ? 'text-red-600 font-semibold'
                            : 'text-green-600'
                        }`}
                      >
                        {event.currentAttendees}/{event.maxAttendees}
                      </span>
                    </p>
                    <div className="mt-2">
                      <span className="font-medium text-gray-600">Expertise:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {event.guestSpeaker?.expertise?.map((exp, index) => (
                          <span
                            key={index}
                            className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                          >
                            {exp}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{event.description}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(event)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(event._id)}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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

export default EventManagement;