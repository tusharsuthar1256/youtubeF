import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUserService } from '../services/auth.services';
import { login } from '../store/authSlice';
import { FaYoutube } from 'react-icons/fa';

const Login = () => {
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.identifier || !formData.password) {
      setError('Please fill all fields');
      return;
    }
    setLoading(true);
    setError('');
    
    try {
      const data = await loginUserService(formData.identifier, formData.password);
      if (data.success && data.data.user) {
        localStorage.setItem('isLoggedIn', 'true');
        dispatch(login({ userData: data.data.user }));
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || 'Login failed! Check credentials.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-[100vh] flex items-center justify-center bg-[#0f0f0f] px-4 font-sans text-white">
      <div className="w-full max-w-sm bg-[#121212] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <FaYoutube className="text-5xl text-red-600 mb-2" />
          <h2 className="text-3xl font-semibold tracking-tight">Sign in</h2>
          <p className="text-gray-400 mt-2">to continue to YT</p>
        </div>

        {error && <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg text-center">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div className="flex flex-col">
             <input
              type="text"
              placeholder="Email or Username"
              value={formData.identifier}
              onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
              className="bg-[#121212] border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-all disabled:opacity-50"
              required
            />
          </div>

          <div className="flex flex-col">
            <input
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="bg-[#121212] border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#3ea6ff] focus:ring-1 focus:ring-[#3ea6ff] transition-all disabled:opacity-50"
              required
            />
          </div>
          
          <div className="flex items-center justify-between mt-6">
            <Link to="/signup" className="text-[#3ea6ff] hover:text-blue-400 font-semibold transition-colors">
              Create account
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#3ea6ff] hover:bg-[#3ea6ff]/80 text-black font-semibold py-2.5 px-6 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto"></div>
              ) : (
                'Next'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
