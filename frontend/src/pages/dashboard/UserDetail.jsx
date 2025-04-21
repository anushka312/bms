import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCheck, FaTimes } from 'react-icons/fa';

const UserDetail = () => {
  const { id } = useParams();
  const [detail, setDetail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [action, setAction] = useState('');
  const [months, setMonths] = useState(12);
  const [showMessage, setShowMessage] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await fetch(`http://localhost:5000/employee/user_details/${id}`);
      const data = await res.json();
      setDetail(data);
    } catch (err) {
      console.error('Failed to fetch user detail:', err);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  if (!detail) return <div className="p-6 text-center text-xl">Loading...</div>;

  const { customer, loan, payments, account, transactions } = detail;

  const formatDate = (date) => {
    return new Date(date).toLocaleString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  };

  const userIcon = customer.customer_name.charAt(0).toUpperCase();

  const closeModal = () => {
    setIsModalOpen(false);
    setAction('');
    setMonths(12);
  };

  const handleStatusChange = async (status) => {
    try {
      const response = await fetch(`http://localhost:5000/loan/${loan.loan_number}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: status, months }),
      });

      const data = await response.json();

      if (response.ok) {
        setAction('');
        setIsModalOpen(false);
        setShowMessage(true);
        setTimeout(() => setShowMessage(false), 3000); // hide message after 3s
        fetchDetail(); // re-fetch updated detail
      } else {
        console.error('Failed to update loan status. Server message:', data.message);
      }
    } catch (err) {
      console.error('Error updating loan status:', err);
    }
  };

  // Sort payments by due date, and separate pending and paid payments
  const sortedPayments = [...payments].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  const pendingPayments = sortedPayments.filter(p => p.payment_status === 'pending');
  const paidPayments = sortedPayments.filter(p => p.payment_status === 'paid');

  return (
    <div className="flex justify-center items-center p-6 w-full">
      <div className="w-2/3 space-y-8">

        {showMessage && (
          <div className="bg-green-200 text-green-800 text-center py-3 rounded-lg">
            Mail has been sent to the customer.
          </div>
        )}

        {/* Profile */}
        <div className="flex justify-between items-center p-6 mt-10">
          <div>
            <h1 className="text-5xl font-semibold text-black mb-3">{customer.customer_name}</h1>
            <p className="text-xl text-gray-600 mb-2"><strong>Email:</strong> {customer.email}</p>
            <p className="text-xl text-gray-600"><strong>Customer ID:</strong> {customer.customer_id}</p>
          </div>
          <div className="w-20 h-20 flex items-center justify-center bg-rose-500 text-white text-3xl font-semibold rounded-full">
            {userIcon}
          </div>
        </div>

        {/* Loan */}
        {loan && (
          <div className={`bg-white shadow-lg rounded-lg p-6 mt-6 border-l-8 ${loan.status === 'approved' ? 'border-green-500' : loan.status === 'rejected' ? 'border-red-500' : 'border-yellow-500'}`}>
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Loan Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p className="text-lg"><strong>Loan Number:</strong> {loan.loan_number}</p>
              <p className="text-lg"><strong>Amount:</strong> ₹{loan.amount}</p>
              <p className="text-lg"><strong>Status:</strong>
                <span className={`font-bold ml-2 ${loan.status === 'approved' ? 'text-green-500' : loan.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {loan.status}
                </span>
              </p>
              <p className="text-lg"><strong>Start Date:</strong> {formatDate(loan.loan_start_date)}</p>
            </div>

            {/* Payments Table */}
            <h3 className="text-xl font-medium text-gray-700 mt-4 mb-2">Payments</h3>
            <div className="overflow-x-auto">
              <table className="w-full border border-gray-300 text-center">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b">#</th>
                    <th className="px-4 py-2 border-b">Amount</th>
                    <th className="px-4 py-2 border-b">Date</th>
                    <th className="px-4 py-2 border-b">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {payments
                    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date)) // Sort payments by due_date
                    .map((p, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{p.payment_number}</td>
                        <td className="px-4 py-2 border-b">₹{p.payment_amount}</td>
                        <td className="px-4 py-2 border-b">{formatDate(p.due_date)}</td>
                        <td className={`px-4 py-2 border-b font-semibold ${p.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                          {p.payment_status}
                        </td>
                      </tr>
                    ))}


                  {/* Render Paid Payments Below */}
                  {paidPayments.map((p, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border-b">{p.payment_number}</td>
                      <td className="px-4 py-2 border-b">₹{p.payment_amount}</td>
                      <td className="px-4 py-2 border-b">{formatDate(p.due_date)}</td>
                      <td className={`px-4 py-2 border-b font-semibold text-green-600`}>
                        {p.payment_status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Approve/Reject */}
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-xl mb-4 text-center">Are you sure you want to {action} this loan?</h2>
              {action === 'approve' && (
                <div className="mb-4">
                  <label htmlFor="months" className="block text-lg">Number of Months:</label>
                  <input
                    type="number"
                    id="months"
                    value={months}
                    onChange={(e) => setMonths(Math.max(1, e.target.value))}
                    className="w-full p-2 mt-2 border rounded-md"
                    min="1"
                  />
                </div>
              )}
              <div className="flex justify-around">
                <button
                  onClick={() => handleStatusChange(action === 'approve' ? 'approved' : 'rejected')}
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

        {/* Account & Transactions */}
        {account && (
          <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
            <h2 className="text-2xl font-semibold text-green-800 mb-4">Account Details</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <p className="text-lg"><strong>Account Number:</strong> {account.account_number}</p>
              <p className="text-lg"><strong>Balance:</strong> ₹{account.balance}</p>
            </div>

            <h3 className="text-xl font-medium text-gray-700 mt-4 mb-2">Transactions</h3>
            <div className="overflow-x-auto text-center">
              <table className="min-w-full table-auto border border-gray-300 text-center">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border-b">Txn ID</th>
                    <th className="px-4 py-2 border-b">Type</th>
                    <th className="px-4 py-2 border-b">Sender</th>
                    <th className="px-4 py-2 border-b">Receiver</th>
                    <th className="px-4 py-2 border-b">Amount</th>
                    <th className="px-4 py-2 border-b">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t, i) => {
                    const isSent = t.sender_account === account.account_number;
                    return (
                      <tr key={i} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b">{t.transaction_id}</td>
                        <td className={`px-4 py-2 border-b font-medium ${isSent ? 'text-red-600' : 'text-green-600'}`}>
                          {isSent ? 'Sent' : 'Received'}
                        </td>
                        <td className="px-4 py-2 border-b">{t.sender_account}</td>
                        <td className="px-4 py-2 border-b">{t.receiver_account}</td>
                        <td className="px-4 py-2 border-b">₹{t.amount}</td>
                        <td className="px-4 py-2 border-b">{formatDate(t.transaction_date)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetail;
