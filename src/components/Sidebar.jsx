import React from 'react';
import { NavLink } from 'react-router-dom';
import { MdHome, MdSubscriptions, MdVideoLibrary, MdHistory, MdThumbUp } from 'react-icons/md';

const SidebarItem = ({ to, icon, text, isOpen }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-4 py-3 px-3 rounded-lg hover:bg-gray-800 transition-colors mx-2 ${
          isActive ? 'bg-gray-800' : ''
        } ${isOpen ? '' : 'justify-center py-4'}`
      }
      title={!isOpen ? text : ''}
    >
      <span className="text-2xl">{icon}</span>
      {isOpen && <span className="text-[14px] truncate">{text}</span>}
    </NavLink>
  );
};

const Sidebar = ({ isOpen }) => {
  return (
    <aside
      className={`h-full bg-[#0f0f0f] border-r border-gray-800 overflow-y-auto no-scrollbar pt-2 transition-all duration-300 ${
        isOpen ? 'w-60' : 'w-20 hidden md:block'
      }`}
    >
      <div className="flex flex-col mb-4 border-b border-gray-800 pb-4">
        <SidebarItem to="/" icon={<MdHome />} text="Home" isOpen={isOpen} />
        <SidebarItem to="/subscriptions" icon={<MdSubscriptions />} text="Subscriptions" isOpen={isOpen} />
      </div>

      <div className="flex flex-col mb-4">
        {isOpen && <h3 className="px-5 text-gray-400 font-semibold mb-2 mt-2">You</h3>}
        <SidebarItem to="/history" icon={<MdHistory />} text="History" isOpen={isOpen} />
        <SidebarItem to="/playlist" icon={<MdVideoLibrary />} text="Playlists" isOpen={isOpen} />
        <SidebarItem to="/liked" icon={<MdThumbUp />} text="Liked videos" isOpen={isOpen} />
      </div>
    </aside>
  );
};

export default Sidebar;
