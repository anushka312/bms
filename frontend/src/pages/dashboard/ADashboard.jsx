import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAdminAuth } from '../../context/AdminAuthContext';

const ADashboard = () => {
  const { employee } = useAdminAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAccounts: 0,
    totalLoans: 0,
    pendingLoans: 0,
  });

  const [recentUsers, userDetails] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatDateToLocalTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleString();
  };
  useEffect(() => {
    if (employee?.employee_id) {
      fetchStats();
    }
  }, [employee?.employee_id]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Total users
      const usersRes = await axios.get(`http://localhost:5000/custbanker/${employee.employee_id}`);
      const totalUsers = Array.isArray(usersRes.data) ? usersRes.data.length : 0;

      // Total accounts
      const accountsRes = await axios.get(`http://localhost:5000/other/${employee.employee_id}/accounts`);
      const totalAccounts = parseInt(accountsRes.data[0]?.totalaccounts, 10) || 0;

      // Total loans
      const loansRes = await axios.get(`http://localhost:5000/other/${employee.employee_id}/loans`);
      const totalLoans = parseInt(loansRes.data[0]?.totalloans, 10) || 0;

      // Pending loans
      const pendingLoansRes = await axios.get(`http://localhost:5000/other/${employee.employee_id}/ploans`);
      const pendingLoans = parseInt(pendingLoansRes.data[0]?.pendingloans, 10) || 0;

      // Recent users
      const userDetailsres = await axios.get(`http://localhost:5000/other/users_name/${employee.employee_id}`);
      userDetails(userDetailsres.data || []);

      // Recent loans
      const recentLoansRes = await axios.get(`http://localhost:5000/other/loan_details/${employee.employee_id}`);
      setRecentLoans(recentLoansRes.data || []);

      setStats({
        totalUsers,
        totalAccounts,
        totalLoans,
        pendingLoans,
      });
    } catch (err) {
      console.error(' Error fetching dashboard stats:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center">
        <motion.h1
          className="text-5xl md:text-7xl mb-14"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          Loading...
        </motion.h1>
        <div className="flex justify-center">
          <div className="animate-spin w-10 h-10 border-4 border-gray-300 border-t-indigo-500 rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <motion.h1
        className="text-5xl md:text-7xl mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Welcome, {employee?.employee_name || 'Admin'}!
      </motion.h1>

      {error && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>
      )}
      <div className='flex justify-end'>
        <button
          onClick={fetchStats}
          className="mb-6 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700 transition"
        >
          🔄 Refresh Stats
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <Card title="Total Users" value={stats.totalUsers} color="bg-blue-500" />
        <Card title="Total Accounts" value={stats.totalAccounts} color="bg-green-500" />
        <Card title="Total Loans" value={stats.totalLoans} color="bg-rose-500" />
        <Card title="Pending Loans" value={stats.pendingLoans} color="bg-yellow-500" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/*  Users */}
        <div className="bg-white shadow rounded-xl bg-opacity-70 p-6">
          <h2 className="text-xl font-semibold mb-4">Your Customers</h2>
          <ul className="space-y-2">
            {recentUsers.length === 0 ? (
              <p className="text-gray-500">No users found.</p>
            ) : (
              recentUsers.slice(0, 5).map((user, idx) => (
                <li key={idx} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xl font-semibold text-gray-900">{user.customer_name || user.name}</p>
                      <p className="text-lg text-gray-600">Customer ID: {user.customer_id}</p>
                      <p className="text-lg text-gray-600">Email: {user.email}</p>
                    </div>

                  </div>
                </li>

              ))
            )}
          </ul>
        </div>

        {/* Loans */}
        <div className="bg-white shadow rounded-xl p-6 bg-opacity-90">
          <h2 className="text-xl font-semibold mb-4"> Loans</h2>
          <ul className="space-y-2">
            {recentLoans.length === 0 ? (
              <p className="text-gray-500">No loans found.</p>
            ) : (
              recentLoans.slice(0, 5).map((loan, idx) => (
                <li
                  key={idx}
                  className="border rounded-lg p-4 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm sm:text-base"
                >
                  <div className="w-full sm:w-1/5 font-semibold text-left">{loan.customer_name || 'Unknown'}</div>
                  <div className="w-full sm:w-1/5 text-gray-600 text-left">{loan.customer_id || 'Unknown'}</div>
                  <div className="w-full sm:w-1/5 text-gray-600 text-left truncate">{loan.email || 'Unknown'}</div>
                  <div className="w-full sm:w-1/5 text-gray-600 text-left">{formatDateToLocalTime(loan.loan_start_date) || 'Unknown'}</div>
                  <span className={`w-full sm:w-1/5 text-center font-medium px-2 py-1 rounded ${loan.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : loan.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                    {loan.status}
                  </span>
                </li>


              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

const Card = ({ title, value, color }) => (
  <div className={`${color} text-white p-10 rounded-xl shadow-lg`}>
    <h2 className="text-2xl font-semibold">{title}</h2>
    <p className="text-3xl mt-4">{value}</p>
  </div>
);

export default ADashboard;
