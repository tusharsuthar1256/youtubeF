import React, { useState } from 'react';
import { FiMenu, FiSearch, FiBell, FiVideo } from 'react-icons/fi';
import { FaYoutube } from 'react-icons/fa';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { logoutUserService } from '../services/auth.services';

const Navbar = ({ toggleSidebar }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { status, userData } = useAuth();
  const dispatch = useDispatch();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUserService();
      localStorage.removeItem('isLoggedIn');
      dispatch(logout());
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#0f0f0f] h-14 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
        >
          <FiMenu className="text-xl" />
        </button>
        <Link to="/" className="flex items-center gap-1">
          <FaYoutube className="text-3xl text-red-600" />
          <span className="text-xl font-semibold tracking-tighter">YT</span>
        </Link>
      </div>

      <div className="flex-1 max-w-2xl px-4 flex justify-center">
        <form
          onSubmit={handleSearch}
          className="flex items-center w-full max-w-[600px] bg-[#121212] border border-gray-700 rounded-full overflow-hidden"
        >
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent px-4 py-2 outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#222222] border-l border-gray-700 hover:bg-gray-700 transition-colors"
          >
            <FiSearch className="text-xl text-gray-400" />
          </button>
        </form>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        {status ? (
          <>
            <Link to="/upload" className="hidden sm:block p-2 hover:bg-gray-800 rounded-full transition-colors">
              <FiVideo className="text-xl" />
            </Link>
            <button className="hidden sm:block p-2 hover:bg-gray-800 rounded-full transition-colors">
              <FiBell className="text-xl" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                onBlur={() => setTimeout(() => setIsProfileDropdownOpen(false), 200)}
                className="focus:outline-none flex items-center"
              >
                <img
                  src={userData?.avatar || 'https://via.placeholder.com/150'}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-gray-700 object-cover cursor-pointer hover:border-gray-500 transition-colors"
                />
              </button>
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#282828] rounded-md shadow-lg py-1 border border-gray-700 z-50">
                  <Link 
                    to={`/profile/${userData?.username}`} 
                    className="block px-4 py-2 text-sm hover:bg-[#3ea6ff] hover:text-white"
                    onMouseDown={(e) => {
                      e.preventDefault(); // Prevents blur from firing early
                      setIsProfileDropdownOpen(false);
                      navigate(`/profile/${userData?.username}`);
                    }}
                  >
                    Your channel
                  </Link>
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsProfileDropdownOpen(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-red-600 hover:text-white"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <Link
            to="/login"
            className="flex items-center gap-2 px-4 py-1.5 border border-gray-700 rounded-full hover:bg-[#263850] hover:text-[#3ea6ff] hover:border-transparent transition-colors text-blue-400 font-medium"
          >
            <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">
              <span className="text-[10px]">&nbsp;</span>
            </div>
            Sign in
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
