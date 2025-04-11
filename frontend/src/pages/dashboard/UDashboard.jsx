import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';

const UDashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true); // Loading state to track data fetching

  const fetchAccount = async () => {
    if (!user?.customer_id) return;

    setLoading(true); // Set loading to true when fetching starts
    try {
      const res = await axios.get(`http://localhost:5000/accounts/customer/${user.customer_id}`);
      setAccount(res.data);
    } catch (err) {
      console.error('Failed to fetch account:', err);
      setAccount(null);
    } finally {
      setLoading(false); // Set loading to false once the data is fetched
    }
  };

  const fetchTransactions = async () => {
    if (!user?.customer_id) return;

    setLoading(true); // Set loading to true when fetching starts
    try {
      const trimmedCustomerId = user.customer_id?.toString().trim();
      const res = await axios.get(`http://localhost:5000/transactions/customer/${trimmedCustomerId}`);



      setTransactions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false); // Set loading to false once the data is fetched
    }
  };

  useEffect(() => {
    fetchAccount();
    fetchTransactions();
  }, [user?.customer_id]);

  const createAccount = async () => {
    try {
      await axios.post('http://localhost:5000/accounts', {
        account_number: user.customer_id,
        balance: 0,
      });
      alert('Account created!');
      fetchAccount();
    } catch (err) {
      console.error('Error creating account:', err);
      alert('Failed to create account');
    }
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

      {loading ? (
        <div className="flex justify-center items-center mt-8">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          {!account ? (
            <div className="mt-8 p-3">
              <p className="text-xl mb-4">You don't have an account yet.</p>
              <button
                className="bg-blue-600 text-white px-6 py-2 rounded-xl shadow hover:bg-blue-700 transition"
                onClick={createAccount}
              >
                Create Account
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-3xl font-bold mt-8">Account Info</h2>
              <div className="bg-white shadow-md rounded-xl p-6 my-4">
                <p><strong>Account Number:</strong> {account.account_number}</p>
                <p><strong>Balance:</strong> ₹ {account.balance}</p>
              </div>

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
                      transactions.map((txn, idx) => (
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
            </>
          )}
        </>
      )}
    </div>
  );
};

export default UDashboard;
