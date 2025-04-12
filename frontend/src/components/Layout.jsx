import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboard from '../assets/dashboard.jpg';

const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/ulogin');
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex relative overflow-hidden   max-h-screen overflow-y-auto"
      style={{ backgroundImage: `url(${dashboard})` }}
    >
      {/* Sidebar */}
      {sidebarOpen && (
        <aside className="fixed top-0 left-0 h-full w-64 bg-white/30 backdrop-blur-md shadow-md z-50 flex flex-col justify-end">
          <div className="p-4 border-b border-gray-300 flex items-center justify-between">
            <p className="text-gray-700 font-semibold">Menu</p>
            <button onClick={() => setSidebarOpen(false)} className="text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col justify-end">
            <div className="p-6 flex flex-col gap-4 text-gray-800 font-medium">
              <p className="text-md text-gray-500">
                Welcome, {user?.customer_name || 'Guest'}
              </p>
              <NavLink
                to="/uhome"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition  ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink to="/transactions" className={({ isActive }) =>
                  `p-2 rounded-lg transition  ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`}>
                Transactions
              </NavLink>
              <NavLink to="/profile" className={({ isActive }) =>
                  `p-2 rounded-lg transition  ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`}>
                Profile
              </NavLink>
              <NavLink to="/settings" className={({ isActive }) =>
                  `p-2 rounded-lg transition  ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`}>
                Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-white/40 transition text-left text-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Toggle Button */}
      {!sidebarOpen && (
        <button
          className="absolute top-4 left-4 z-50 bg-transparent p-2 hover:bg-gray-100 transition"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content */}
      <main className={`flex-1 mt-20 p-4 transition-all duration-300 ${sidebarOpen ? 'md:ml-64' : ''}`}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
