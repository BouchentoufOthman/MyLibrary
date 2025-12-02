import React from 'react';
import {BrowserRouter as Router, Routes, Route, Navigate} from 'react-router-dom';

import AdminSidebar from "./components/AdminSidebar";
import StudentSidebar from "./components/StudentSidebar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import BookManagement from "./pages/BookManagement";
import ShelfManagement from "./pages/ShelfManagement";
import StudyRoomManagement from "./pages/StudyRoomManagement";
import ReservationManagement from "./pages/ReservationManagement";
import StudyRoomReservationManagement from "./pages/StudyRoomReservationManagement";
import GuestSpeakerManagement from "./pages/GuestSpeakerManagement";
import EventManagement from "./pages/EventManagement";
import GuestDashboard from "./pages/GuestDashboard";
import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [user, setUser] = React.useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  console.log('Current user in App:', user);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/users/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUser(response.data);
        } catch (err) {
          setError('Failed to fetch user data');
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    }
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50">
        {/* Conditional Sidebar Rendering */}
        {user && user.role === 'admin' && <AdminSidebar user={user} setUser={setUser} />}
        {user && user.role === 'student' && <StudentSidebar user={user} setUser={setUser} />}
        
        {/* Main Content */}
        <div className="flex-1">
          <Routes>
<Route 
  path="/" 
  element={
    user ? (
      user.role === 'admin' ? (
        <Navigate to="/admin/dashboard" replace />
      ) : user.role === 'guest' ? (
        <Navigate to="/guest/dashboard" replace />
      ) : (
        <Navigate to="/student/dashboard" replace />
      )
    ) : (
      <Navigate to="/login" replace/>
    )
  } 
/>
<Route 
  path="/login" 
  element={
    user ? (
      user.role === 'admin' ? (
        <Navigate to="/admin/dashboard" replace />
      ) : user.role === 'guest' ? (
        <Navigate to="/guest/dashboard" replace />
      ) : (
        <Navigate to="/student/dashboard" replace />
      )
    ) : (
      <Login setUser={setUser} />
    )
  } 
/>
            <Route 
              path="/register" 
              element={
                user ? (
                  <Navigate to="/" replace />
                ) : (
                  <Register setUser={setUser} />
                )
              } 
            />
            
            {/* Admin Routes */}
            <Route 
              path="/admin/dashboard" 
              element={
                user && user.role === 'admin' ? (
                  <AdminDashboard user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/admin/books" 
              element={
                user && user.role === 'admin' ? (
                  <BookManagement />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/admin/shelves" 
              element={
                user && user.role === 'admin' ? (
                  <ShelfManagement />
                ) : (
                  <Navigate to="/login"replace />
                )
              } 
            />
            <Route 
              path="/admin/studyrooms" 
              element={
                user && user.role === 'admin' ? (
                  <StudyRoomManagement />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/admin/reservations" 
              element={
                user && user.role === 'admin' ? (
                  <ReservationManagement />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/admin/studyroom-reservations" 
              element={
                user && user.role === 'admin' ? (
                  <StudyRoomReservationManagement />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            <Route 
              path="/admin/events" 
              element={
                user && user.role === 'admin' ? (
                  <EventManagement />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />

            {/* Student Routes */}
            <Route 
              path="/student/dashboard" 
              element={
                user && user.role === 'student' ? (
                  <StudentDashboard user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            {/* Guest Routes */}
            <Route 
                path="/guest/dashboard" 
              element={
                user && user.role === 'guest' ? (
                  <GuestDashboard user={user} setUser={setUser} />
                ) : (
                  <Navigate to="/login" replace />
                )
              } 
            />
            
          </Routes>

        </div>
      </div>
    </Router>
  );
}

export default App;