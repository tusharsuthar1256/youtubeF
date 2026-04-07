import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login, logout } from './store/authSlice';
import { getCurrentUserService } from './services/auth.services';
import AppRoutes from './routes/AppRoutes';
import { Toaster } from 'react-hot-toast';

function App() {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    if (isLoggedIn === 'true') {
      getCurrentUserService()
        .then((res) => {
          if (res.data) {
            dispatch(login({ userData: res.data }));
          } else {
            dispatch(logout());
            localStorage.removeItem('isLoggedIn');
          }
        })
        .catch(() => {
          dispatch(logout());
          localStorage.removeItem('isLoggedIn');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f] text-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#3ea6ff]"></div>
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes />
      <Toaster position="bottom-right" reverseOrder={false} />
    </Router>
  );
}

export default App;
