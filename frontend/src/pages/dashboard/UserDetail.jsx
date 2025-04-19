import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa'; // Importing icons for tick and cross

const UserDetail = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await fetch(`http://localhost:5000/employee/user_details/${id}`);
        const data = await res.json();
        setDetail(data);
      } catch (err) {
        console.error('Failed to fetch user detail:', err);
      }
    };
    fetchDetail();
  }, [id]);

  if (!detail) return <div className="p-6 text-center text-xl">Loading...</div>;

  const { customer, loan, payments, account, transactions } = detail;

  // Function to format dates
  const formatDate = (date) => {
    const options = {
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric', 
      hour: 'numeric', 
      minute: 'numeric', 
      second: 'numeric',
    };
    return new Date(date).toLocaleString(undefined, options);
  };

  // Create a user profile icon (using the first initial of the customer's name)
  const userIcon = customer.customer_name.charAt(0).toUpperCase();

  // Handle the modal close action
  const closeModal = () => {
    setIsModalOpen(false);
    setAction('');
  };

  // Handle the status update
  const handleStatusChange = (status) => {
    console.log(`Loan Status updated to: ${status}`);
    setAction('');
    setIsModalOpen(false);
    // Ideally, here you would call an API to update the loan status
  };

  return (
    <div className="flex justify-center items-center p-6 w-full">
      <div className="w-2/3 space-y-8">
        
        {/* Profile section with the user icon */}
        <div className="flex justify-between items-center p-6 mt-10">
          <div>
            <h1 className="text-5xl font-semibold text-black mb-3 ">{customer.customer_name}</h1>
            <p className="text-xl text-gray-600 mb-2"><strong>Email:</strong> {customer.email}</p>
            <p className="text-xl text-gray-600 "><strong>Customer ID:</strong> {customer.customer_id}</p>
          </div>

          <div className="w-20 h-20 flex items-center justify-center bg-rose-500 text-white text-3xl font-semibold rounded-full">
            {userIcon}
          </div>
        </div>

        {/* Loan Details */}
        {loan && (
          <div className={`bg-white shadow-lg rounded-lg p-6 mt-6 ${loan.status === 'Approved' ? 'border-green-500' : loan.status === 'Rejected' ? 'border-red-500' : 'border-yellow-500'}`}>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Loan Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p className="text-lg"><strong>Loan Number:</strong> {loan.loan_number}</p>
              <p className="text-lg"><strong>Amount:</strong> ₹{loan.amount}</p>
              <p className="text-lg"><strong>Status:</strong> 
                <span className={`font-bold text-lg ${loan.status === 'Approved' ? 'text-green-500' : loan.status === 'Rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {loan.status}
                </span>
              </p>
              <p className="text-lg"><strong>Start Date:</strong> {formatDate(loan.loan_start_date)}</p>
            </div>

            <h3 className="text-xl font-medium text-gray-700 mt-4">Payments</h3>
            <ul className="list-disc pl-6 space-y-2">
              {payments.map((p, i) => (
                <li key={i} className="text-lg">
                  <span className="font-semibold">#{p.payment_number}</span> – ₹{p.payment_amount} on {formatDate(p.payment_date)} ({p.payment_status})
                </li>
              ))}
            </ul>

            {/* Status Change Button */}
            {loan.status === 'pending' && (
              <div className="mt-6 flex justify-center space-x-6">
                <button
                  onClick={() => {
                    setAction('approve');
                    setIsModalOpen(true);
                  }}
                  className="bg-green-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-green-600 flex items-center"
                >
                  <FaCheck className="mr-2" /> Approve
                </button>
                <button
                  onClick={() => {
                    setAction('reject');
                    setIsModalOpen(true);
                  }}
                  className="bg-red-500 text-white py-2 px-6 rounded-lg shadow-md hover:bg-red-600 flex items-center"
                >
                  <FaTimes className="mr-2" /> Reject
                </button>
              </div>
            )}
          </div>
        )}

        {/* Modal for Confirming Status Change */}
        {isModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl mb-4 text-center">Are you sure you want to {action} this loan?</h2>
              <div className="flex justify-around">
                <button
                  onClick={() => handleStatusChange(action === 'approve' ? 'Approved' : 'Rejected')}
                  className="bg-blue-500 text-white py-2 px-4 rounded"
                >
                  Yes
                </button>
                <button
                  onClick={closeModal}
                  className="bg-gray-400 text-white py-2 px-4 rounded"
                >
                  No
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Account Details */}
        {account && (
          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Account Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p className="text-lg"><strong>Account Number:</strong> {account.account_number}</p>
              <p className="text-lg"><strong>Balance:</strong> ₹{account.balance}</p>
            </div>

            <h3 className="text-xl font-medium text-gray-700 mt-4">Transactions</h3>
            <ul className="list-disc pl-6 space-y-2">
              {transactions.map((t, i) => (
                <li key={i} className="text-lg">
                  <span className={t.sender_account === account.account_number ? 'text-red-600' : 'text-green-600'}>
                    {t.sender_account === account.account_number ? 'Sent' : 'Received'}
                  </span>
                  &nbsp;₹{t.amount} on {formatDate(t.timestamp)}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
