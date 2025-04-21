import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext'; // Importing the context
import { useNavigate } from 'react-router-dom';

const Loan = () => {
    const navigate = useNavigate();
    const { user } = useAuth();  // Using the user from context to access logged-in user details
    const [customerId, setCustomerId] = useState('');
    const [loanAmount, setLoanAmount] = useState('');
    const [branchName, setBranchName] = useState('');
    const [loanPurpose, setLoanPurpose] = useState('');

    // Prefill customerId using the user from context
    useEffect(() => {
        if (user && user.customer_id) {
            setCustomerId(user.customer_id); // Set the customer ID from context
        }
    }, [user]); // Only run when user changes

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/loan/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    customer_id: customerId,
                    amount: loanAmount,
                    branch_name: branchName, // Include branch_name if applicable
                }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Loan request sent successfully');
                navigate('/uhome'); // Redirect to dashboard
            } else {
                alert(data.message || 'Loan application failed');
            }
        } catch (error) {
            console.error('Server error:', error);
            alert('Server error');
        }

        console.log("Customer ID:", customerId);
        console.log("Loan Amount:", loanAmount);
    };
    useEffect(() => {
        if (user && user.customer_id) {
            setCustomerId(user.customer_id);

            fetch(`http://localhost:5000/customer/${user.customer_id}`)
                .then(res => res.json())
                .then(data => {
                    setBranchName(data.customer_city);  
                });
        }
    }, [user]);

    return (
        <div className="flex justify-center items-center min-h-screen p-4">
            <div className=" p-10 my-12 bg-white/50 bg-opacity-60 rounded-xl shadow-md w-1/3">
                <p className="text-5xl text-center mb-3 font-semibold">Apply for Loan</p>
                <p className="text-md text-gray-500 text-center mb-6">A mail will be sent to your registered email after approval.</p>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer ID Field (Prefilled) */}
                    <div>
                        <p className="text-lg mb-2">Customer ID:</p>
                        <input
                            type="text"
                            value={customerId} // Prefilled from state
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded-md"
                            disabled
                        />
                    </div>

                    {/* Loan Amount Field */}
                    <div>
                        <p className="text-lg mb-2">Enter Loan Amount:</p>
                        <input
                            type="number"
                            placeholder="Amount"
                            value={loanAmount}
                            onChange={(e) => setLoanAmount(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded-md"
                            required
                        />
                    </div>
                    <div>
                        <p className="text-lg mb-2">Branch City:</p>
                        <input
                            type="text"
                            value={branchName}
                            disabled
                            className="w-full p-3 bg-white border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Loan Purpose (Optional) */}
                    <div>
                        <p className="text-lg mb-2">Loan Purpose:</p>
                        <input
                            type="text"
                            placeholder="Personal, Business, etc."
                            value={loanPurpose}
                            onChange={(e) => setLoanPurpose(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded-md"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Loan;
