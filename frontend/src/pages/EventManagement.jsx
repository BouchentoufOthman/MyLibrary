import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventManagement = () => {
  const [events, setEvents] = useState([]);
  const [guestUsers, setGuestUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    guestUserId: '',
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
    fetchGuestUsers();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/events', config);
      setEvents(response.data);
    } catch (err) {
      setError('Failed to fetch events');
    }
  };

  const fetchGuestUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/users/guests', config);
      setGuestUsers(response.data);
    } catch (err) {
      console.error('Failed to fetch guest users');
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
        setSuccess('Event updated successfully! Invitation sent to guest.');
      } else {
        await axios.post('/api/events', formData, config);
        setSuccess('Event created successfully! Invitation sent to guest.');
      }

      setFormData({
        title: '',
        description: '',
        guestUserId: '',
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
      
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
      setTimeout(() => setError(''), 5000);
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      guestUserId: event.guestUser._id,
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
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      guestUserId: '',
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
            {guestUsers.length === 0 && (
              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="text-yellow-700">
                  <strong>Note:</strong> No guest speakers have registered yet. Guests must register with a guest account before you can create events.
                </p>
              </div>
            )}
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
                    name="guestUserId"
                    value={formData.guestUserId}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                    required
                  >
                    <option value="">Select a guest speaker</option>
                    {guestUsers.map((guest) => (
                      <option key={guest._id} value={guest._id}>
                        {guest.username} ({guest.email})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    An invitation will be automatically sent to the selected guest
                  </p>
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
                  disabled={guestUsers.length === 0}
                  className={`px-6 py-2 rounded-lg ${
                    guestUsers.length === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                >
                  {editingEvent ? 'Update Event & Send Invitation' : 'Create Event & Send Invitation'}
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
                      <div className="flex flex-col items-end space-y-2">
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
                        
                        {/* Visibility Badge */}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center ${
                            event.isVisibleToStudents
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {event.isVisibleToStudents ? (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                              </svg>
                              Visible to Students
                            </>
                          ) : (
                            <>
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.452.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" />
                                <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                              </svg>
                              Hidden from Students
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Guest Speaker:</span> {event.guestUser?.username}
                    </p>
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium">Email:</span> {event.guestUser?.email}
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
                  </div>
                </div>

                <p className="text-gray-600 mb-4">{event.description}</p>

                {/* Invitation Status Display */}
                <div className={`mb-4 p-3 rounded-lg border-l-4 ${
                  event.invitationStatus === 'accepted' 
                    ? 'bg-green-50 border-green-500'
                    : event.invitationStatus === 'declined'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-yellow-50 border-yellow-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-800">
                        Invitation Status: {' '}
                        <span className={
                          event.invitationStatus === 'accepted' 
                            ? 'text-green-700'
                            : event.invitationStatus === 'declined'
                            ? 'text-red-700'
                            : 'text-yellow-700'
                        }>
                          {event.invitationStatus.charAt(0).toUpperCase() + event.invitationStatus.slice(1)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-600">
                        Guest: {event.guestUser?.username} ({event.guestUser?.email})
                      </p>
                      {event.invitationSentAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Sent: {new Date(event.invitationSentAt).toLocaleString()}
                        </p>
                      )}
                      {event.invitationRespondedAt && (
                        <p className="text-xs text-gray-500">
                          Responded: {new Date(event.invitationRespondedAt).toLocaleString()}
                        </p>
                      )}
                    </div>
                    {event.invitationStatus === 'accepted' && (
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {event.invitationStatus === 'declined' && (
                      <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                    {event.invitationStatus === 'pending' && (
                      <svg className="w-8 h-8 text-yellow-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 flex-wrap">
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