import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold">
            MyLibrary
          </Link>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm">
                  Welcome, {user.username} ({user.role})
                </span>
                {user.role === 'admin' ? (
                  <>
                    <Link 
                      to="/admin/dashboard" 
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Dashboard
                    </Link>
                    <Link 
                      to="/admin/books" 
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Books
                    </Link>
                    <Link 
                      to="/admin/shelves" 
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Shelves
                    </Link>
                    <Link 
                      to="/admin/studyrooms" 
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Study Rooms
                    </Link>
                    <Link 
                      to="/admin/reservations" 
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Book Res.
                    </Link>
                        <Link to="/admin/studyroom-reservations" className="hover:bg-blue-700 px-3 py-2 rounded">
                      Room Res.
                    </Link>
                    <Link 
                      to="/admin/guest-speakers" 
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Guest Speakers
                    </Link>
                    <Link 
                      to="/admin/events" 
                      className="hover:bg-blue-700 px-3 py-2 rounded"
                    >
                      Events
                    </Link>
                  </>
                ) : (
                  <Link 
                    to="/student/dashboard" 
                    className="hover:bg-blue-700 px-3 py-2 rounded"
                  >
                    My Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="hover:bg-blue-700 px-3 py-2 rounded"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;