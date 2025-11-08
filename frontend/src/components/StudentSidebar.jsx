import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

const StudentSidebar = ({ user, setUser }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [stats, setStats] = useState({
    activeBookReservations: 0,
    activeRoomReservations: 0,
    upcomingEvents: 0,
  });
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      // Fetch book reservations
      const bookRes = await axios.get('/api/reservations/my-reservations', config);
      const activeBooks = bookRes.data.filter(r => r.status === 'active').length;

      // Fetch room reservations
      const roomRes = await axios.get('/api/studyroom-reservations/my-reservations', config);
      const activeRooms = roomRes.data.filter(r => r.status === 'active').length;

      // Fetch events
      const eventsRes = await axios.get('/api/events/my/registered', config);
      const upcomingEvents = eventsRes.data.filter(e => e.status === 'upcoming').length;

      setStats({
        activeBookReservations: activeBooks,
        activeRoomReservations: activeRooms,
        upcomingEvents: upcomingEvents,
      });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      path: '/student/dashboard',
      section: 'books',
      badge: null,
    },
  ];

  const sections = [
    {
      name: 'Books',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      onClick: () => navigate('/student/dashboard', { state: { activeTab: 'books' } }),
      badge: null,
    },
    {
      name: 'My Book Reservations',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      onClick: () => navigate('/student/dashboard', { state: { activeTab: 'reservations' } }),
      badge: stats.activeBookReservations > 0 ? stats.activeBookReservations : null,
    },
    {
      name: 'Study Rooms',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
      onClick: () => navigate('/student/dashboard', { state: { activeTab: 'studyrooms' } }),
      badge: stats.activeRoomReservations > 0 ? stats.activeRoomReservations : null,
    },
    {
      name: 'Events',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
        </svg>
      ),
      onClick: () => navigate('/student/dashboard', { state: { activeTab: 'events' } }),
      badge: stats.upcomingEvents > 0 ? stats.upcomingEvents : null,
    },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setIsExpanded(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-gradient-to-b from-blue-900 via-teal-900 to-blue-900 text-white z-30 transition-all duration-300 ease-in-out shadow-2xl ${
          isExpanded ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          {isExpanded && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-teal-400 to-blue-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold">MyLibrary</h1>
                <p className="text-xs text-blue-300">Student Portal</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${
                isExpanded ? 'rotate-0' : 'rotate-180'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* User Profile */}
        {isExpanded && (
          <div className="p-4 border-b border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-teal-400 rounded-full flex items-center justify-center text-lg font-bold">
                {user?.username?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold truncate">{user?.username}</p>
                <p className="text-xs text-blue-300 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 bg-blue-700 text-xs rounded-full">
                  Student
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {isExpanded && (
          <div className="p-4 border-b border-blue-700">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-800 bg-opacity-50 p-3 rounded-lg">
                <p className="text-xs text-blue-300">Books</p>
                <p className="text-xl font-bold">{stats.activeBookReservations}</p>
              </div>
              <div className="bg-teal-800 bg-opacity-50 p-3 rounded-lg">
                <p className="text-xs text-teal-300">Events</p>
                <p className="text-xl font-bold">{stats.upcomingEvents}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 px-2">
          <div className="space-y-1">
            {/* Dashboard Link */}
            {menuItems.map((item, index) => (
              <Link
                key={index}
                to={item.path}
                className={`flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-gradient-to-r from-teal-600 to-blue-600 shadow-lg scale-105'
                    : 'hover:bg-blue-800 hover:scale-105'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${isActive(item.path) ? 'text-white' : 'text-blue-300 group-hover:text-white'}`}>
                    {item.icon}
                  </div>
                  {isExpanded && (
                    <span className="font-medium truncate">{item.title}</span>
                  )}
                </div>
                {!isExpanded && (
                  <div className="absolute left-20 bg-gray-900 text-white px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                    {item.title}
                  </div>
                )}
              </Link>
            ))}

            {/* Section Divider */}
            {isExpanded && (
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider px-3">
                  Navigation
                </p>
              </div>
            )}

            {/* Navigation Sections */}
            {sections.map((section, index) => (
              <button
                key={index}
                onClick={section.onClick}
                className="w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all duration-200 group hover:bg-blue-800 hover:scale-105"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-blue-300 group-hover:text-white">
                    {section.icon}
                  </div>
                  {isExpanded && (
                    <span className="font-medium truncate text-left">{section.name}</span>
                  )}
                </div>
                {isExpanded && section.badge && (
                  <span className="px-2 py-1 bg-red-500 text-xs rounded-full font-semibold">
                    {section.badge}
                  </span>
                )}
                {!isExpanded && (
                  <div className="absolute left-20 bg-gray-900 text-white px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg flex items-center gap-2">
                    {section.name}
                    {section.badge && (
                      <span className="px-2 py-0.5 bg-red-500 text-xs rounded-full font-semibold">
                        {section.badge}
                      </span>
                    )}
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Quick Actions 
          {isExpanded && (
            <div className="mt-6 px-3">
              <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-3">
                Quick Actions
              </p>
              <div className="space-y-2">
                <button
                  onClick={() => navigate('/student/dashboard', { state: { activeTab: 'books' } })}
                  className="w-full flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-green-600 to-teal-600 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="text-sm font-medium">Browse Books</span>
                </button>
                <button
                  onClick={() => navigate('/student/dashboard', { state: { activeTab: 'studyrooms' } })}
                  className="w-full flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium">Book Room</span>
                </button>
                <button
                  onClick={() => navigate('/student/dashboard', { state: { activeTab: 'events' } })}
                  className="w-full flex items-center space-x-3 px-3 py-2 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg hover:from-orange-700 hover:to-red-700 transition-all hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                  <span className="text-sm font-medium">View Events</span>
                </button>
              </div>
            </div>
          )}*/}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-blue-700">
          <button
            onClick={handleLogout}
            className={`flex items-center space-x-3 px-3 py-3 rounded-lg hover:bg-red-600 transition-all duration-200 w-full group hover:scale-105 ${
              !isExpanded && 'justify-center'
            }`}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            {isExpanded && <span className="font-medium">Logout</span>}
            {!isExpanded && (
              <div className="absolute left-20 bg-gray-900 text-white px-3 py-2 rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow-lg">
                Logout
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Spacer for main content */}
      <div className={`transition-all duration-300 ${isExpanded ? 'ml-64' : 'ml-20'}`}></div>
    </>
  );
};

export default StudentSidebar;