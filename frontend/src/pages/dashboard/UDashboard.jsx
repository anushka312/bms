import React, { useState, useEffect } from 'react';
import dashboard from '../../assets/dashboard.jpg';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const UDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.customer_id) {
        try {
          const res = await axios.get(`http://localhost:5000/customer/${user.customer_id}`);
          setUserData(res.data);
          
        } catch (err) {
          console.error('Failed to fetch user data:', err);
        }
      }
    };

    fetchUserData();
  }, [user]);

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex relative transition-all duration-500"
      style={{ backgroundImage: `url(${dashboard})` }}
    >
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-md transform transition-transform duration-300 z-50
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col justify-end p-6 gap-6 text-gray-800 font-medium">
          <p className="text-md text-gray-500">
            Welcome, {userData?.customer_name || user?.customer_name || "Guest"}
          </p>
          <NavLink
            to="/uhome"
            className={({ isActive }) =>
              `p-2 rounded-lg transition ${
                isActive ? 'bg-gray-200 font-semibold' : 'hover:bg-gray-100'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink to="/transactions" className="p-2 rounded-lg hover:bg-gray-100 transition">
            Transactions
          </NavLink>
          <NavLink to="/profile" className="p-2 rounded-lg hover:bg-gray-100 transition">
            Profile
          </NavLink>
          <NavLink to="/settings" className="p-2 rounded-lg hover:bg-gray-100 transition">
            Settings
          </NavLink>
          <button
            onClick={logout}
            className="p-2 rounded-lg hover:bg-gray-100 transition text-left"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        className="absolute top-4 left-6 z-50 bg-white p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
    </div>
  );
};

export default UDashboard;
