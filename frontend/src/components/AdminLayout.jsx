import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';
import adminBg from '../assets/admin-dashboard.jpg'; 

const AdminLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { employee, logout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/alogin'); 
  };

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex relative overflow-hidden max-h-screen overflow-y-auto"
      style={{ backgroundImage: `url(${adminBg})` }}
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
                Welcome, {employee?.employee_name || 'Admin'}
              </p>
              <NavLink
                to="/ahome"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/users"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`
                }
              >
                Users
              </NavLink>
              <NavLink
                to="/admin/loans"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`
                }
              >
                Loans
              </NavLink>
              <NavLink
                to="/admin/transactions"
                className={({ isActive }) =>
                  `p-2 rounded-lg transition ${isActive ? 'bg-white/50 font-bold' : 'hover:bg-white/40'}`
                }
              >
                Transactions
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

      {/* Menu Button */}
      {!sidebarOpen && (
        <button
          className="fixed top-4 left-4 z-50 bg-transparent p-2 hover:bg-transparent transition"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={20} />
        </button>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 mt-20 p-4 transition-all duration-300 ${
          sidebarOpen ? 'md:ml-64' : ''
        }`}
      >
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
