import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalBooks: 0,
    availableBooks: 0,
    totalShelves: 0,
    totalStudyRooms: 0,
    activeBookReservations: 0,
    overdueReservations: 0,
    activeRoomReservations: 0,
    upcomingEvents: 0,
    totalStudents: 0,
    totalGuestSpeakers: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch all data in parallel
      const [
        booksRes,
        shelvesRes,
        roomsRes,
        bookReservationsRes,
        roomReservationsRes,
        eventsRes,
        speakersRes,
      ] = await Promise.all([
        axios.get('/api/books'),
        axios.get('/api/shelves'),
        axios.get('/api/studyrooms'),
        axios.get('/api/reservations/all', config),
        axios.get('/api/studyroom-reservations/all', config),
        axios.get('/api/events'),
        axios.get('/api/guest-speakers'),
      ]);

      const books = booksRes.data;
      const reservations = bookReservationsRes.data;
      const roomReservations = roomReservationsRes.data;
      const events = eventsRes.data;

      // Calculate stats
      const totalBooks = books.length;
      const availableBooks = books.reduce((sum, book) => sum + book.availableCopies, 0);
      const activeBookReservations = reservations.filter(r => r.status === 'active').length;
      const overdueReservations = reservations.filter(
        r => r.status === 'active' && new Date(r.dueDate) < new Date()
      ).length;
      const activeRoomReservations = roomReservations.filter(r => r.status === 'active').length;
      const upcomingEvents = events.filter(e => e.status === 'upcoming').length;

      // Get unique students from reservations
      const uniqueStudents = new Set(reservations.map(r => r.user?._id).filter(Boolean));
      const guestsRes = await axios.get('/api/users/guests', config);

      setStats({
        totalBooks,
        availableBooks,
        totalShelves: shelvesRes.data.length,
        totalStudyRooms: roomsRes.data.length,
        activeBookReservations,
        overdueReservations,
        activeRoomReservations,
        upcomingEvents,
        totalStudents: uniqueStudents.size,
        totalGuestSpeakers: guestsRes.data.length,
      });

      // Get recent activity (last 5 reservations)
      const recent = reservations
        .sort((a, b) => new Date(b.reservationDate) - new Date(a.reservationDate))
        .slice(0, 5)
        .map(r => ({
          type: 'book',
          user: r.user?.username || 'Unknown',
          item: r.book?.title || 'Unknown Book',
          date: r.reservationDate,
          status: r.status,
        }));

      setRecentActivity(recent);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend, link }) => (
    <Link
      to={link}
      className={`bg-gradient-to-br ${color} p-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white text-opacity-80 text-sm font-medium uppercase tracking-wide">
            {title}
          </p>
          <p className="text-white text-4xl font-bold mt-2">{value}</p>
          {trend && (
            <p className="text-white text-opacity-90 text-xs mt-2 flex items-center">
              {trend.direction === 'up' ? (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {trend.text}
            </p>
          )}
        </div>
        <div className="text-white text-opacity-80">{icon}</div>
      </div>
    </Link>
  );

  const QuickActionCard = ({ title, description, icon, color, link }) => (
<Link to={link} className="group block">
  <div className={`border-l-4 ${color} rounded-xl`}>
    <div className="bg-white p-6 rounded-xl shadow-md group-hover:shadow-xl transform group-hover:scale-105 transition-all duration-300">
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${color.replace('border-', 'bg-').replace('500', '100')} flex-shrink-0`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
          <p className="text-gray-600 text-sm mt-1">{description}</p>
        </div>
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  </div>
</Link>

  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                Welcome back, {user?.username}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's happening in your library today
              </p>
            </div>
            <div className="bg-white px-6 py-3 rounded-lg shadow-md">
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-lg font-bold text-gray-800">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Books"
            value={stats.totalBooks}
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
            color="from-blue-500 to-blue-600"
            link="/admin/books"
          />
          <StatCard
            title="Available Copies"
            value={stats.availableBooks}
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="from-green-500 to-green-600"
            link="/admin/books"
          />
          <StatCard
            title="Active Reservations"
            value={stats.activeBookReservations}
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            }
            color="from-purple-500 to-purple-600"
            link="/admin/reservations"
          />
          <StatCard
            title="Overdue Books"
            value={stats.overdueReservations}
            icon={
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            }
            color="from-red-500 to-red-600"
            link="/admin/reservations"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Link
            to="/admin/shelves"
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalShelves}</p>
                <p className="text-xs text-gray-600">Shelves</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/studyrooms"
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-teal-100 rounded-lg">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudyRooms}</p>
                <p className="text-xs text-gray-600">Study Rooms</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/studyroom-reservations"
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.activeRoomReservations}</p>
                <p className="text-xs text-gray-600">Room Bookings</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/events"
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-pink-100 rounded-lg">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.upcomingEvents}</p>
                <p className="text-xs text-gray-600">Upcoming Events</p>
              </div>
            </div>
          </Link>

          <Link
            to="/admin/guest-speakers"
            className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalGuestSpeakers}</p>
                <p className="text-xs text-gray-600">Speakers</p>
              </div>
            </div>
          </Link>

          <div className="bg-white p-4 rounded-lg shadow-md">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stats.totalStudents}</p>
                <p className="text-xs text-gray-600">Active Students</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h2>
              <div className="space-y-4">
                <QuickActionCard
                  title="Add New Book"
                  description="Add a new book to the library collection"
                  icon={
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                  color="border-blue-500"
                  link="/admin/books"
                />
                <QuickActionCard
                  title="Create Event"
                  description="Schedule a new library event with guest speakers"
                  icon={
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                  color="border-purple-500"
                  link="/admin/events"
                />
                <QuickActionCard
                  title="Manage Study Rooms"
                  description="View and manage study room bookings"
                  icon={
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  }
                  color="border-green-500"
                  link="/admin/studyroom-reservations"
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className={`p-2 rounded-lg ${
                        activity.status === 'active' ? 'bg-green-100' : 'bg-gray-200'
                      }`}>
                        <svg className={`w-5 h-5 ${
                          activity.status === 'active' ? 'text-green-600' : 'text-gray-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {activity.user}
                        </p>
                        <p className="text-xs text-gray-600 truncate">
                          Reserved: {activity.item}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(activity.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        activity.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-200 text-gray-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Alert Section */}
            {stats.overdueReservations > 0 && (
              <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg mt-6">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-red-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-red-800">Overdue Alert!</p>
                    <p className="text-sm text-red-700">
                      {stats.overdueReservations} book{stats.overdueReservations > 1 ? 's' : ''} overdue
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/reservations"
                  className="mt-3 inline-block text-sm text-red-800 font-semibold hover:text-red-900"
                >
                  View Details →
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;