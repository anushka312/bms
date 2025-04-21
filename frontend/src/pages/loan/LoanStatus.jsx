import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';

const LoanStatus = () => {
    const { user } = useAuth();
    const [loanDetails, setLoanDetails] = useState([]);
    const [paymentMessage, setPaymentMessage] = useState('');
    const [paymentError, setPaymentError] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoan, setHasLoan] = useState(false);
    const [loanStatus, setLoanStatus] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });

    // Fetch loan existence and status
    const checkLoanStatus = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/loan/exists/${user.customer_id}`);
            setHasLoan(res.data.hasLoan);
            setLoanStatus(res.data.status);
        } catch (err) {
            console.error('Error checking loan status:', err);
        }
    };

    // Fetch loan details if the user has a loan
    const fetchLoanDetails = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/payment/by-customer/${user.customer_id}`);
            setLoanDetails(res.data);
        } catch (err) {
            console.error('Error fetching loan details:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle payment submission
    const handlePayment = async (paymentNumber, paymentAmount) => {
        setPaymentMessage('');
        setPaymentError('');

        try {
            const res = await axios.post(`http://localhost:5000/payment/${loanDetails[0].loan_number}`, {
                payment_number: paymentNumber,
                payment_amount: parseFloat(paymentAmount),
            });

            setPaymentMessage(res.data.message);
            setNotification({ message: 'Payment successfully recorded!', type: 'success' });
            fetchLoanDetails(); // Refresh after payment to update status
        } catch (err) {
            console.error('Error making payment:', err);
            setPaymentError(err?.response?.data?.message || 'Error processing payment');
            setNotification({ message: 'Error processing payment!', type: 'error' });
        }
    };

    // Effect for checking loan status and fetching details if needed
    useEffect(() => {
        if (user?.customer_id) {
            checkLoanStatus();
        }
    }, [user]);

    useEffect(() => {
        if (hasLoan) {
            fetchLoanDetails();
        }
    }, [hasLoan]);

    // Function to validate and format loan start date
    const formatDate = (date) => {
        const parsedDate = Date.parse(date);
        if (isNaN(parsedDate)) {
            return 'Invalid date';
        }
        return new Date(parsedDate).toLocaleDateString();
    };

    if (isLoading) return <p className="text-center text-2xl">Loading loan details...</p>;
    if (!hasLoan) return <p className="text-center text-2xl text-red-600">No loan found for this customer.</p>;

    if (!loanDetails.length) {
        return <p className="text-center text-2xl">Loading loan details...</p>;
    }

    // Determine the loan status color
    const getLoanStatusColor = (status) => {
        switch (status) {
            case 'approved':
                return 'text-green-600';
            case 'pending':
                return 'text-yellow-600';
            case 'rejected':
                return 'text-red-600';
            default:
                return 'text-gray-600';
        }
    };

    return (
        <div className="relative p-8 max-w-4xl mx-auto">
            <motion.h1
                className="text-7xl text-center mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                Loan Status
            </motion.h1>

            <h2 className={`text-4xl mb-4 text-center font-semibold ${getLoanStatusColor(loanStatus)}`}>
                Status: {loanStatus}
            </h2>

            {/* Loan Status Message */}
            {loanStatus === 'pending' && (
                <p className="text-xl text-yellow-600 text-center mb-6">Your loan is pending approval.</p>
            )}

            {loanStatus === 'rejected' && (
                <p className="text-xl text-red-600 text-center mb-6">Your loan has been rejected.</p>
            )}

            {loanStatus === 'approved' && (
                <>
                    <h3 className="text-3xl font-semibold mt-8 mb-4 text-violet-900">Loan Details</h3>
                    <div className="bg-gray-50 p-6 rounded-lg shadow-md mb-6">
                        <p className="text-xl mb-2"><strong>Loan Number:</strong> {loanDetails[0].loan_number}</p>
                        <p className="text-xl mb-2"><strong>EMI Amount:</strong> ₹{loanDetails[0].payment_amount}</p>
                        <p className="text-xl mb-2"><strong>Branch City:</strong> Delhi</p>
                    </div>

                    {/* Notification section */}
                    {notification.message && (
                        <div
                            className={`p-4 mt-4 rounded-lg text-white ${notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
                        >
                            {notification.message}
                        </div>
                    )}

                    {/* Payments Table */}
                    <h3 className="text-2xl font-semibold mt-8 mb-4 text-gray-800">Payments Made</h3>
                    {loanDetails.length > 0 ? (
                        <div className="overflow-x-auto bg-blue-50 shadow-md rounded-lg">
                            <table className="w-full border-collapse text-center table-auto">
                                <thead className="bg-blue-200">
                                    <tr>
                                        <th className="px-4 py-2 border-b text-lg font-semibold">#</th>
                                        <th className="px-4 py-2 border-b text-lg font-semibold">Amount</th>
                                        <th className="px-4 py-2 border-b text-lg font-semibold">Status</th>
                                        <th className="px-4 py-2 border-b text-lg font-semibold">Payment</th>
                                        <th className="px-4 py-2 border-b text-lg font-semibold">Due Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-lg">
                                    {loanDetails.map((payment, index) => (
                                        <tr key={payment.payment_number || index} className="hover:bg-gray-100">
                                            <td className="px-4 py-2 border-b">{payment.payment_number}</td>
                                            <td className="px-4 py-2 border-b">₹{parseFloat(payment.payment_amount).toFixed(2)}</td>
                                            <td className={`px-4 py-2 border-b ${payment.payment_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                                                {payment.payment_status}
                                            </td>
                                            <td className="px-4 py-2 border-b">
                                                {payment.payment_status === 'pending' && (
                                                    <div className="flex items-center justify-center">
                                                        <button
                                                            onClick={() => handlePayment(payment.payment_number, payment.payment_amount)}
                                                            className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 shadow-lg"
                                                        >
                                                            Make Payment ₹{parseFloat(payment.payment_amount).toFixed(2)}
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-4 py-2 border-b">{new Date(payment.due_date).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-xl">No payments available for this loan.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default LoanStatus;
