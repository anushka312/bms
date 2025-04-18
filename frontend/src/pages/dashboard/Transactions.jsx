import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext'; 

const Transactions = () => {
  const { user } = useAuth(); 
  const customer_id = user?.customer_id;

  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        console.log("Fetching transactions for customer_id:", customer_id);
        const res = await axios.get(`http://localhost:5000/transaction/customer/${customer_id}`);
        console.log("Response received:", res.data);
        setTransactions(res.data);
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to fetch transactions');
      } finally {
        setIsLoading(false);
      }
    };

    if (customer_id) {
      fetchTransactions();
    }
  }, [customer_id]);

  const convertToCSV = () => {
    const headers = ['Transaction ID', 'Sender Account', 'Receiver Account', 'Amount', 'Timestamp'];
    const rows = transactions.map(transaction => [
      transaction.transaction_id,
      transaction.sender_account,
      transaction.receiver_account,
      transaction.amount,
      new Date(transaction.timestamp).toLocaleString()
    ]);

    const csvContent = [
      headers.join(','), // Add headers to CSV
      ...rows.map(row => row.join(',')) // Add each transaction row
    ].join('\n');

    return csvContent;
  };
  const downloadCSV = () => {
    const csvContent = convertToCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions_${customer_id}.csv`; 
    a.click();
    URL.revokeObjectURL(url); 
  };

  return (
    <div className='p-4'>
      <motion.h1
        className="text-7xl p-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        Transaction History
      </motion.h1>

      {isLoading ? (
        <p className="text-xl">Loading transaction history...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : transactions.length === 0 ? (
        <p>No transactions found.</p>
      ) : (
        <div className="mt-6">
          <div className='flex justify-end '>
          <button 
            onClick={downloadCSV} 
            className="bg-blue-500 text-white p-2 rounded mb-4"
          >
            Download as CSV
          </button>
          </div>

          <table className="w-full table-auto border-collapse border bg-white bg-opacity-30  border-gray-300">
            <thead>
              <tr className="bg-blue-100">
                <th className="p-2 border border-gray-300">Transaction ID</th>
                <th className="p-2 border border-gray-300">Sender Account</th>
                <th className="p-2 border border-gray-300">Receiver Account</th>
                <th className="p-2 border border-gray-300">Amount</th>
                <th className="p-2 border border-gray-300">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.transaction_id}>
                  <td className="p-2 border text-center border-gray-300">{transaction.transaction_id}</td>
                  <td className="p-2 border text-center border-gray-300">{transaction.sender_account}</td>
                  <td className="p-2 border text-center border-gray-300">{transaction.receiver_account}</td>
                  <td className="p-2 border text-center border-gray-300">₹ {transaction.amount}</td>
                  <td className="p-2 border text-center border-gray-300">{new Date(transaction.timestamp).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Transactions;
