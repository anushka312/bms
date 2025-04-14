import React, { useState } from 'react';
import loan from '/src/assets/loan.jpg';
import { useNavigate } from 'react-router-dom';

const Loan = () => {
    const navigate = useNavigate();
    const [customerId, setCustomerId] = useState('');
    const [loanAmount, setLoanAmount] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/loan/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: loanAmount, customer_id: customerId }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Loan request successful');
                // console.log('User:', data);

                navigate('/uhome'); // Redirect to dashboard
            } else {
                alert(data.message || 'Loan failed');
            }
        } catch (error) {
            console.error('Server error:', error);
            alert('Server error');
        }
        console.log("Customer ID:", customerId);
        console.log("Loan Amount:", loanAmount);
    };

    return (
        <div
            className="w-screen h-screen bg-cover flex items-center justify-center"
            style={{ backgroundImage: `url(${loan})` }}
        >
            <div className="p-8 bg-white/50 bg-opacity-60 rounded-xl shadow-md w-96">
                <p className="text-2xl text-center mb-6 font-semibold">Register for Loan</p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer ID Field */}
                    <div>
                        <p className="text-lg mb-2">Enter Customer ID:</p>
                        <input
                            type="text"
                            placeholder="XXX"
                            value={customerId}
                            onChange={(e) => setCustomerId(e.target.value)}
                            className="w-full p-3 bg-white border border-gray-300 rounded-md"
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
