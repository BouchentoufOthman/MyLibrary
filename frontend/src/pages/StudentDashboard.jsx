import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const StudentDashboard = ({ user }) => {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [myReservations, setMyReservations] = useState([]);
  const [studyRooms, setStudyRooms] = useState([]);
  const [myStudyRoomReservations, setMyStudyRoomReservations] = useState([]);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [showStudyRoomModal, setShowStudyRoomModal] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [reservationForm, setReservationForm] = useState({
    studyRoomId: '',
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('books'); // 'books', 'reservations', 'studyrooms', 'events'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())||
    book.genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
      // Clear the state after using it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    fetchBooks();
    fetchMyReservations();
    fetchStudyRooms();
    fetchMyStudyRoomReservations();
    fetchEvents();
    fetchMyEvents();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get('/api/books');
      setBooks(response.data);
    } catch (err) {
      setError('Failed to fetch books');
    }
  };

  const fetchMyReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/reservations/my-reservations', config);
      setMyReservations(response.data);
    } catch (err) {
      console.error('Failed to fetch reservations');
    }
  };

  const fetchStudyRooms = async () => {
    try {
      const response = await axios.get('/api/studyrooms');
      setStudyRooms(response.data.filter(room => room.isAvailable));
    } catch (err) {
      console.error('Failed to fetch study rooms');
    }
  };

  const fetchMyStudyRoomReservations = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/studyroom-reservations/my-reservations', config);
      setMyStudyRoomReservations(response.data);
    } catch (err) {
      console.error('Failed to fetch study room reservations');
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/api/events');
      // Filter to show only upcoming events
      const upcomingEvents = response.data.filter(event => event.status === 'upcoming');
      setEvents(upcomingEvents);
    } catch (err) {
      console.error('Failed to fetch events');
    }
  };

  const fetchMyEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/events/my/registered', config);
      setMyEvents(response.data);
    } catch (err) {
      console.error('Failed to fetch registered events');
    }
  };

  const fetchAvailableSlots = async (roomId, date) => {
    try {
      const response = await axios.get(`/api/studyroom-reservations/available-slots/${roomId}/${date}`);
      setAvailableSlots(response.data.availableSlots);
    } catch (err) {
      setError('Failed to fetch available slots');
    }
  };

  const handleReserve = async (bookId) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post('/api/reservations', { bookId }, config);
      setSuccess('Book reserved successfully!');
      fetchBooks();
      fetchMyReservations();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reservation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleReturn = async (reservationId) => {
    if (!window.confirm('Are you sure you want to return this book?')) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`/api/reservations/${reservationId}/return`, {}, config);
      setSuccess('Book returned successfully!');
      fetchBooks();
      fetchMyReservations();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Return failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setReservationForm({ ...reservationForm, studyRoomId: room._id });
    
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    setReservationForm({ ...reservationForm, studyRoomId: room._id, date: today });
    
    fetchAvailableSlots(room._id, today);
    setShowStudyRoomModal(true);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setReservationForm({ ...reservationForm, date, startTime: '', endTime: '' });
    if (selectedRoom) {
      fetchAvailableSlots(selectedRoom._id, date);
    }
  };

  const handleSlotSelect = (slot) => {
    setReservationForm({
      ...reservationForm,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
  };

  const handleStudyRoomReservation = async () => {
    setError('');
    setSuccess('');

    if (!reservationForm.startTime || !reservationForm.endTime) {
      setError('Please select a time slot');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post('/api/studyroom-reservations', reservationForm, config);
      setSuccess('Study room reserved successfully!');
      setShowStudyRoomModal(false);
      setReservationForm({
        studyRoomId: '',
        date: '',
        startTime: '',
        endTime: '',
        purpose: '',
      });
      fetchMyStudyRoomReservations();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reservation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCancelStudyRoom = async (reservationId) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`/api/studyroom-reservations/${reservationId}/cancel`, {}, config);
      setSuccess('Reservation cancelled successfully!');
      fetchMyStudyRoomReservations();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Cancellation failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleCompleteStudyRoom = async (reservationId) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.put(`/api/studyroom-reservations/${reservationId}/complete`, {}, config);
      setSuccess('Reservation completed successfully!');
      fetchMyStudyRoomReservations();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Completion failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleEventDetails = (event) => {
    setSelectedEvent(event);
    setShowEventDetails(true);
  };

  const handleRegisterEvent = async (eventId) => {
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(`/api/events/${eventId}/register`, {}, config);
      setSuccess('Successfully registered for the event!');
      fetchEvents();
      fetchMyEvents();
      setShowEventDetails(false);
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleUnregisterEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to unregister from this event?')) return;

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      await axios.post(`/api/events/${eventId}/unregister`, {}, config);
      setSuccess('Successfully unregistered from the event');
      fetchEvents();
      fetchMyEvents();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unregistration failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const isRegisteredForEvent = (eventId) => {
    return myEvents.some(event => event._id === eventId);
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">
            Welcome, {user?.username}!
          </h1>
          <p className="text-gray-600">
            Browse available books, manage your reservations, book study rooms, and register for events
          </p>
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex border-b overflow-x-auto">
            <button
              onClick={() => setActiveTab('books')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'books'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Available Books
            </button>
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'reservations'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              My Book Reservations ({myReservations.filter(r => r.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('studyrooms')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'studyrooms'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Study Rooms ({myStudyRoomReservations.filter(r => r.status === 'active').length})
            </button>
            <button
              onClick={() => setActiveTab('events')}
              className={`px-6 py-3 font-medium whitespace-nowrap ${
                activeTab === 'events'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Events ({myEvents.filter(e => e.status === 'upcoming').length})
            </button>
          </div>
        </div>

        {/* Available Books Tab */}
        {activeTab === 'books' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <input
                type="text"
                placeholder="Search books by title, author, or genre ..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Genre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Shelf
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Available
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {books.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      {searchTerm ? 'No books match your search' : 'No books available'}
                    </td>
                  </tr>
                ) : (
                  filteredBooks.map((book) => (
                    <tr key={book._id}>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{book.title}</div>
                        {book.description && (
                          <div className="text-sm text-gray-500">{book.description}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.author}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{book.genre}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {book.shelf?.shelfNumber || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-sm ${
                            book.availableCopies > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {book.availableCopies}/{book.copies}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleReserve(book._id)}
                          disabled={book.availableCopies === 0}
                          className={`px-4 py-2 rounded ${
                            book.availableCopies > 0
                              ? 'bg-blue-500 text-white hover:bg-blue-600'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          {book.availableCopies > 0 ? 'Reserve' : 'Unavailable'}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* My Reservations Tab */}
        {activeTab === 'reservations' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
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
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {myReservations.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                      You have no book reservations
                    </td>
                  </tr>
                ) : (
                  myReservations.map((reservation) => (
                    <tr key={reservation._id}>
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
                            isOverdue(reservation.dueDate) && reservation.status === 'active'
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
                              ? isOverdue(reservation.dueDate)
                                ? 'bg-red-100 text-red-800'
                                : 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {reservation.status === 'active' && isOverdue(reservation.dueDate)
                            ? 'Overdue'
                            : reservation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {reservation.status === 'active' ? (
                          <button
                            onClick={() => handleReturn(reservation._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Return
                          </button>
                        ) : (
                          <span className="text-gray-500">
                            Returned on {new Date(reservation.returnDate).toLocaleDateString()}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Study Rooms Tab - Keep existing code */}
        {activeTab === 'studyrooms' && (
          <div>
            {/* My Study Room Reservations */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">My Study Room Reservations</h2>
              {myStudyRoomReservations.filter(r => r.status === 'active').length === 0 ? (
                <p className="text-gray-500">You have no active study room reservations. You can book one below.</p>
              ) : (
                <div className="space-y-4">
                  {myStudyRoomReservations
                    .filter(r => r.status === 'active')
                    .map((reservation) => (
                      <div key={reservation._id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                        <div>
                          <h3 className="font-semibold text-lg text-gray-800">
                            {reservation.studyRoom?.name} (Room #{reservation.studyRoom?.roomNumber})
                          </h3>
                          <p className="text-gray-600">
                            <span className="font-medium">Date:</span> {new Date(reservation.date).toLocaleDateString()}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Time:</span> {reservation.startTime} - {reservation.endTime}
                          </p>
                          {reservation.purpose && (
                            <p className="text-gray-600">
                              <span className="font-medium">Purpose:</span> {reservation.purpose}
                            </p>
                          )}
                          <p className="text-gray-600">
                            <span className="font-medium">Capacity:</span> {reservation.studyRoom?.capacity} people
                          </p>
                          {reservation.studyRoom?.facilities?.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {reservation.studyRoom.facilities.map((facility, index) => (
                                <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                  {facility}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleCompleteStudyRoom(reservation._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                          >
                            Complete
                          </button>
                          <button
                            onClick={() => handleCancelStudyRoom(reservation._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Available Study Rooms */}
            {myStudyRoomReservations.filter(r => r.status === 'active').length === 0 && (
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Study Rooms</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {studyRooms.length === 0 ? (
                    <div className="col-span-full text-center text-gray-500 py-8">
                      No study rooms available
                    </div>
                  ) : (
                    studyRooms.map((room) => (
                      <div key={room._id} className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{room.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">Room #{room.roomNumber}</p>
                        
                        <div className="mb-4">
                          <p className="text-gray-600 mb-2">
                            <span className="font-medium">Location:</span> {room.location}
                          </p>
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

                        <button
                          onClick={() => handleRoomSelect(room)}
                          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Book This Room
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Past Reservations */}
            {myStudyRoomReservations.filter(r => r.status !== 'active').length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Reservations</h2>
                <div className="space-y-3">
                  {myStudyRoomReservations
                    .filter(r => r.status !== 'active')
                    .map((reservation) => (
                      <div key={reservation._id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              {reservation.studyRoom?.name} (Room #{reservation.studyRoom?.roomNumber})
                            </h3>
                            <p className="text-gray-600 text-sm">
                              {new Date(reservation.date).toLocaleDateString()} | {reservation.startTime} - {reservation.endTime}
                            </p>
                          </div>
                          <span
                            className={`px-3 py-1 rounded text-sm ${
                              reservation.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {reservation.status}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div>
            {/* My Registered Events */}
            {myEvents.filter(e => e.status === 'upcoming').length > 0 && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">My Registered Events</h2>
                <div className="grid grid-cols-1 gap-4">
                  {myEvents
                    .filter(e => e.status === 'upcoming')
                    .map((event) => (
                      <div key={event._id} className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold text-gray-800">{event.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{event.category}</p>
                            <div className="grid grid-cols-2 gap-4 mt-4">
                              <div>
                                <p className="text-gray-600">
                                  <span className="font-medium">Speaker:</span> {event.guestSpeaker?.name}
                                </p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Date:</span> {new Date(event.date).toLocaleDateString()}
                                </p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Time:</span> {event.startTime} - {event.endTime}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-600">
                                  <span className="font-medium">Location:</span> {event.location}
                                </p>
                                <p className="text-gray-600">
                                  <span className="font-medium">Attendees:</span> {event.currentAttendees}/{event.maxAttendees}
                                </p>
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleUnregisterEvent(event._id)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-4"
                          >
                            Unregister
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Available Events */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Available Events</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {events.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 py-8 bg-white rounded-lg shadow">
                  No upcoming events available
                </div>
              ) : (
                events.map((event) => {
                  const isRegistered = isRegisteredForEvent(event._id);
                  const isFull = event.currentAttendees >= event.maxAttendees;
                  
                  return (
                    <div key={event._id} className="bg-white rounded-lg shadow-lg p-6">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold text-gray-800">{event.title}</h3>
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                          {event.category}
                        </span>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          {event.guestSpeaker?.photoUrl && (
                            <img
                              src={event.guestSpeaker.photoUrl}
                              alt={event.guestSpeaker.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">{event.guestUser?.username}</p>
                            <p className="text-sm text-gray-500">{event.guestUser?.email}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {event.guestSpeaker?.expertise?.map((exp, index) => (
                            <span
                              key={index}
                              className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                            >
                              {exp}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">{event.description}</p>

                      <div className="space-y-2 mb-4">
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">📅 Date:</span> {new Date(event.date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">🕒 Time:</span> {event.startTime} - {event.endTime}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">📍 Location:</span> {event.location}
                        </p>
                        <p className="text-gray-600 text-sm">
                          <span className="font-medium">👥 Spots:</span>{' '}
                          <span className={isFull ? 'text-red-600 font-semibold' : 'text-green-600'}>
                            {event.maxAttendees - event.currentAttendees} available ({event.currentAttendees}/{event.maxAttendees})
                          </span>
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEventDetails(event)}
                          className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                        >
                          View Details
                        </button>
                        {isRegistered ? (
                          <button
                            onClick={() => handleUnregisterEvent(event._id)}
                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                          >
                            Unregister
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRegisterEvent(event._id)}
                            disabled={isFull}
                            className={`flex-1 px-4 py-2 rounded ${
                              isFull
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                          >
                            {isFull ? 'Full' : 'Register'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Past Events */}
            {myEvents.filter(e => e.status !== 'upcoming').length > 0 && (
              <div className="mt-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Past Events</h2>
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Event
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Speaker
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {myEvents
                        .filter(e => e.status !== 'upcoming')
                        .map((event) => (
                          <tr key={event._id}>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{event.title}</div>
                              <div className="text-sm text-gray-500">{event.category}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {event.guestSpeaker?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {new Date(event.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 py-1 rounded text-sm ${
                                  event.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {event.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Study Room Booking Modal - Keep existing code */}
        {showStudyRoomModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Book {selectedRoom.name}
              </h2>
              
              <div className="mb-6">
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Room:</span> #{selectedRoom.roomNumber}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Location:</span> {selectedRoom.location}
                </p>
                <p className="text-gray-600 mb-2">
                  <span className="font-medium">Capacity:</span> {selectedRoom.capacity} people
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={getTodayDate()}
                  onChange={handleDateChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                />
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Available Time Slots
                </label>
                {availableSlots.length === 0 ? (
                  <p className="text-gray-500">No available slots for this date</p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {availableSlots.map((slot, index) => (
                      <button
                        key={index}
                        onClick={() => handleSlotSelect(slot)}
                        className={`p-3 border rounded-md text-sm ${
                          reservationForm.startTime === slot.startTime
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Purpose (Optional)
                </label>
                <textarea
                  value={reservationForm.purpose}
                  onChange={(e) =>
                    setReservationForm({ ...reservationForm, purpose: e.target.value })
                  }
                  rows="3"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-200 outline-none"
                  placeholder="e.g., Group study, Project work, Exam preparation"
                />
              </div>

              {reservationForm.startTime && (
                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Reservation Summary</h3>
                  <p className="text-gray-600">
                    <span className="font-medium">Date:</span> {new Date(selectedDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Time:</span> {reservationForm.startTime} - {reservationForm.endTime}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Duration:</span> 1 hour
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleStudyRoomReservation}
                  disabled={!reservationForm.startTime}
                  className={`flex-1 py-3 rounded-lg font-medium ${
                    reservationForm.startTime
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Confirm Reservation
                </button>
                <button
                  onClick={() => {
                    setShowStudyRoomModal(false);
                    setSelectedRoom(null);
                    setReservationForm({
                      studyRoomId: '',
                      date: '',
                      startTime: '',
                      endTime: '',
                      purpose: '',
                    });
                  }}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Event Details Modal */}
        {showEventDetails && selectedEvent && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">{selectedEvent.title}</h2>
                  <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded mt-2">
                    {selectedEvent.category}
                  </span>
                </div>
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Guest Speaker Info */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Guest Speaker</h3>
                <div className="flex items-start gap-4">
                  {selectedEvent.guestSpeaker?.photoUrl && (
                    <img
                      src={selectedEvent.guestSpeaker.photoUrl}
                      alt={selectedEvent.guestSpeaker.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-800">
                      {selectedEvent.guestSpeaker?.name}
                    </h4>
                    {selectedEvent.guestSpeaker?.organization && (
                      <p className="text-gray-600">{selectedEvent.guestSpeaker.organization}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedEvent.guestSpeaker?.expertise?.map((exp, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm mt-3">{selectedEvent.guestSpeaker?.bio}</p>
                    <div className="mt-3 space-y-1">
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Email:</span> {selectedEvent.guestSpeaker?.email}
                      </p>
                      <p className="text-gray-600 text-sm">
                        <span className="font-medium">Phone:</span> {selectedEvent.guestSpeaker?.phone}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Details */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Event Details</h3>
                <p className="text-gray-700 mb-4">{selectedEvent.description}</p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Date</p>
                    <p className="font-semibold text-gray-800">
                      {new Date(selectedEvent.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Time</p>
                    <p className="font-semibold text-gray-800">
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-800">{selectedEvent.location}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Available Spots</p>
                    <p className={`font-semibold ${
                      selectedEvent.currentAttendees >= selectedEvent.maxAttendees
                        ? 'text-red-600'
                        : 'text-green-600'
                    }`}>
                      {selectedEvent.maxAttendees - selectedEvent.currentAttendees} of {selectedEvent.maxAttendees}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                {isRegisteredForEvent(selectedEvent._id) ? (
                  <button
                    onClick={() => {
                      handleUnregisterEvent(selectedEvent._id);
                      setShowEventDetails(false);
                    }}
                    className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 font-medium"
                  >
                    Unregister from Event
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterEvent(selectedEvent._id)}
                    disabled={selectedEvent.currentAttendees >= selectedEvent.maxAttendees}
                    className={`flex-1 py-3 rounded-lg font-medium ${
                      selectedEvent.currentAttendees >= selectedEvent.maxAttendees
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-green-500 text-white hover:bg-green-600'
                    }`}
                  >
                    {selectedEvent.currentAttendees >= selectedEvent.maxAttendees
                      ? 'Event Full'
                      : 'Register for Event'}
                  </button>
                )}
                <button
                  onClick={() => setShowEventDetails(false)}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;