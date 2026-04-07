import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaYoutube } from 'react-icons/fa';
import { registerUserService } from '../services/auth.services';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    avatar: null,
    coverImage: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!formData.avatar) {
      setError('Avatar is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) {
             data.append(key, formData[key]);
        }
      });
      
      const response = await registerUserService(data);
      if (response.success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Registration failed.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] py-12 px-4 shadow-xl">
      <div className="w-full max-w-md bg-[#121212] p-8 rounded-2xl border border-gray-800 shadow-2xl">
        <div className="flex flex-col items-center mb-6">
          <FaYoutube className="text-5xl text-red-600 mb-2" />
          <h2 className="text-2xl font-semibold tracking-tight text-white">Create a YT Account</h2>
        </div>

        {error && <div className="mb-4 bg-red-500/10 border border-red-500/50 text-red-500 text-sm px-4 py-3 rounded-lg text-center">{error}</div>}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <input
            type="text"
            name="fullName"
            placeholder="Full Name"
            onChange={handleChange}
            required
            className="bg-[#121212] border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#3ea6ff] w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Email address"
            onChange={handleChange}
            required
            className="bg-[#121212] border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#3ea6ff] w-full"
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            onChange={handleChange}
            required
            className="bg-[#121212] border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#3ea6ff] w-full"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            required
            className="bg-[#121212] border border-gray-600 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#3ea6ff] w-full"
          />
          <div className="flex flex-col gap-2 mt-2">
               <label className="text-sm text-gray-400">Avatar (Required)</label>
               <input
                 type="file"
                 name="avatar"
                 accept="image/*"
                 onChange={handleChange}
                 required
                 className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#263850] file:text-[#3ea6ff] hover:file:bg-[#3ea6ff]/20 text-gray-300"
               />
          </div>
          <div className="flex flex-col gap-2 mt-2">
               <label className="text-sm text-gray-400">Cover Image (Optional)</label>
               <input
                 type="file"
                 name="coverImage"
                 accept="image/*"
                 onChange={handleChange}
                 className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#263850] file:text-[#3ea6ff] hover:file:bg-[#3ea6ff]/20 text-gray-300"
               />
          </div>

          <div className="flex items-center justify-between mt-6">
            <Link to="/login" className="text-[#3ea6ff] hover:text-blue-400 font-semibold transition-colors">
              Sign in instead
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-[#3ea6ff] hover:bg-[#3ea6ff]/80 text-black font-semibold py-2.5 px-6 rounded-full transition-colors disabled:opacity-50 min-w-[100px]"
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

export default Signup;
