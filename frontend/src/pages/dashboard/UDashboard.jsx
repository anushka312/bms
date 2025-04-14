import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from React Router

const UDashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [accountType, setAccountType] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showBalance, setShowBalance] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate(); // Initialize the navigate hook

  // Fetch account data based on customer_id
  const fetchAccountType = async () => {
    if (!user?.customer_id) return;
    try {
      const res = await axios.get(`http://localhost:5000/custbankers/${user.customer_id}`);
      setAccountType(res.data[0]);
    } catch (err) {
      console.error('Failed to fetch account:', err);
      setAccountType(null);
    }
  };

  const fetchAccount = async () => {
    if (!user?.customer_id) return;
    try {
      const res = await axios.get(`http://localhost:5000/accounts/customer/${user.customer_id}`);
      setAccount(res.data);
    } catch (err) {
      console.error('Failed to fetch account:', err);
      setAccount(null);
    }
  };

  // Fetch transactions based on customer_id
  const fetchTransactions = async () => {
    if (!user?.customer_id) return;
    try {
      const res = await axios.get(`http://localhost:5000/transactions/customer/${user.customer_id}`);
      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    }
  };

  // Fetch account and transactions when user.customer_id changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAccount();
      await fetchTransactions();
      await fetchAccountType();
      setLoading(false);
    };
    loadData();
  }, [user?.customer_id]);

  // Display the first 5 transactions or all based on showAll state
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

  // Function to redirect to the loan application page
  const goToLoanPage = () => {
    navigate('/loan'); // Redirect to the Loan page
  };

  return (
    <div className="p-4">
      <motion.h1
        className="text-7xl p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Hello, {user?.customer_name || 'Guest'}!
      </motion.h1>

      {/* Account Info Card */}
      {loading ? (
        <div className="flex  justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : !account ? (
        <div className="mt-8 p-3">
          <p className="text-xl mb-7">You don't have an account yet.</p>
          <div className="flex flex-row gap-4 justify-center items-center">
            <div className="bg-white p-6 rounded-md shadow-md w-2/6 bg-white/30 bg-opacity-50">
              <label className="block mb-2 text-xl">Choose your account type to create an account instantly!</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">-- Select Type --</option>
                <option value="savings">Savings</option>
                <option value="checking">Checking</option>
              </select>

              <button
                onClick={async () => {
                  if (!accountType) {
                    alert('Please select an account type.');
                    return;
                  }

                  try {
                    const res = await axios.post('http://localhost:5000/accounts/', {
                      customer_id: user.customer_id,
                      type: accountType,
                    });
                    alert('Account created successfully!');
                    await fetchAccount(); // re-fetch account info
                  } catch (err) {
                    console.error(err);
                    alert('Failed to create account.');
                  }
                }}
                className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
              >
                Create Account
              </button>
            </div>

            {/* The "OR" text */}
            <span className="text-xl font-semibold">OR</span>

            {/* Loan Application Button */}
            <div className="bg-white p-6 rounded-md shadow-md w-1/4 bg-white/30 bg-opacity-50">
              <label className="block mb-2 text-xl">Tap here to get loan in seconds!</label>
              <button
                onClick={goToLoanPage} // Redirect to loan application page
                className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
              >
                Apply for Loan
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-xl p-6 my-4 max-w-md w-1/4 h-40 text-xl">
          <p className="flex items-center justify-between">
            <span>
              <strong>Account Number:</strong> {account.account_number}
            </span>
          </p>
          <p className="flex items-center justify-between mt-2">
            <span>
              <strong>Balance:</strong> ₹ {showBalance ? account.balance : '•••••'}
            </span>
            <button
              onClick={() => setShowBalance(!showBalance)}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              {showBalance ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </p>
          <p className="flex items-center justify-between mt-2">
            <span>
              <strong>Account Type:</strong> {accountType?.type || 'N/A'}
            </span>
          </p>
        </div>
      )}

      {/* Only show recent transactions if account exists */}
      {account && (
        <>
          <h2 className="text-2xl font-semibold mt-8 mb-4">Recent Transactions</h2>
          <div className="max-h-[400px] overflow-y-auto rounded-lg shadow-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  <th className="py-2 px-4 text-left">Sender</th>
                  <th className="py-2 px-4 text-left">Receiver</th>
                  <th className="py-2 px-4 text-left">Amount</th>
                  <th className="py-2 px-4 text-left">Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-4 px-4 text-center text-gray-500">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  displayedTransactions.map((txn, idx) => (
                    <tr
                      key={idx}
                      className={`border-b ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100`}
                    >
                      <td className="py-2 px-4">{txn.sender_account}</td>
                      <td className="py-2 px-4">{txn.receiver_account}</td>
                      <td className="py-2 px-4">₹ {txn.amount}</td>
                      <td className="py-2 px-4">{new Date(txn.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {transactions.length > 5 && (
            <div className="text-center mt-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-blue-600 hover:underline"
              >
                {showAll ? 'Show Less' : 'View All'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UDashboard;
