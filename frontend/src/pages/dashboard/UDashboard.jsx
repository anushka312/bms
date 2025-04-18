import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const UDashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [accountType, setAccountType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositMessage, setDepositMessage] = useState(''); 
  const [withdrawMessage, setWithdrawMessage] = useState(''); 
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.customer_id) {
      fetchAccount();
    }
  }, [user]);

  const fetchAccount = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`http://localhost:5000/account/customer/${user.customer_id}`);
      if (res.data.length === 0) {
        setAccount(null);
      } else {
        const acc = res.data[0];
        setAccount({
          account_number: acc.account_number,
          balance: acc.balance,
          account_type: acc.type
        });
      }
    } catch (err) {
      if (err.response?.status !== 404) {
        console.error('Failed to fetch account:', err);
        alert('Error fetching account');
      } else {
        setAccount(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createAccount = async () => {
    if (!accountType) {
      alert('Please select an account type.');
      return;
    }

    try {
      await axios.post('http://localhost:5000/account/', {
        customer_id: user.customer_id,
        account_type: accountType,
      });
      alert('Account created successfully!');
      fetchAccount();
    } catch (err) {
      console.error('Failed to create account:', err);
      alert('Error creating account');
    }
  };

  const goToLoanPage = () => {
    navigate('/loan');
  };

  const toggleBalanceVisibility = () => {
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      setDepositMessage('Please enter a valid amount.');
      return;
    }

    try {
      const newBalance = parseFloat(account.balance) + parseFloat(depositAmount);

      await axios.put(`http://localhost:5000/account/${account.account_number}`, {
        balance: newBalance,
        amount: parseFloat(depositAmount),
        receiver_account: account.account_number
      });

      setDepositMessage('Deposit successful!');
      setDepositAmount('');
      await fetchAccount();
    } catch (err) {
      console.error('Error during deposit:', err);
      setDepositMessage('Error depositing money.');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      setWithdrawMessage('Please enter a valid amount.');
      return;
    }

    try {
      if (withdrawAmount > account.balance) {
        setWithdrawMessage('Not enough balance in account!');
        return;
      }
      const newBalance = parseFloat(account.balance) - parseFloat(withdrawAmount);

      await axios.put(`http://localhost:5000/account/${account.account_number}`, {
        balance: newBalance,
        amount: -parseFloat(withdrawAmount),
        receiver_account: account.account_number
      });

      setWithdrawMessage('Withdrawal successful!');
      setWithdrawAmount('');
      await fetchAccount();
    } catch (err) {
      console.error('Error during withdrawal:', err);
      setWithdrawMessage('Error withdrawing money.');
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

      {isLoading ? (
        <div className="flex justify-center items-center">
          <p className="text-xl">Loading account details...</p>
        </div>
      ) : (
        !account ? (
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
                  onClick={createAccount}
                  className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Create Account
                </button>
              </div>

              <span className="text-xl font-semibold">OR</span>

              <div className="bg-white p-6 rounded-md shadow-md w-1/4 bg-white/30 bg-opacity-50">
                <label className="block mb-2 text-xl">Tap here to get a loan in seconds!</label>
                <button
                  onClick={goToLoanPage}
                  className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                  Apply for Loan
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center pt-14 gap-5">
            <div className="bg-white shadow-md rounded-xl p-12 my-3 max-w-md w-1/4 h-auto text-2xl mr-5">
              <p className="flex items-center justify-between">
                <span>
                  <strong>Account Number:</strong> {account.account_number}
                </span>
              </p>
              <p className="flex items-center justify-between mt-2">
                <span>
                  <strong>Balance:</strong> ₹ {isBalanceVisible ? account.balance : '••••••'}
                  <button
                    onClick={toggleBalanceVisibility}
                    className="ml-2"
                  >
                    {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </span>
              </p>
              <p className="flex items-center justify-between mt-2">
                <span>
                  <strong>Account Type:</strong> {account.account_type}
                </span>
              </p>
            </div>

            {/* Deposit Section */}
            <div className="bg-white shadow-md rounded-xl p-6 my-4 max-w-md w-1/4 text-xl mr-5">
              <h2 className="text-2xl mb-4">Deposit Money</h2>
              <div className="flex flex-col">
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Enter amount to deposit"
                  className="mb-4 p-2 border border-gray-300 rounded-md"
                  min="1"
                />
                <button
                  onClick={handleDeposit}
                  className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Deposit
                </button>
              </div>
              {depositMessage && <p className="mt-4 text-xl">{depositMessage}</p>}
            </div>

            {/* Withdrawal section */}
            <div className="bg-white shadow-md rounded-xl p-6 my-4 max-w-md w-1/4 mr-5 text-xl">
              <h2 className="text-2xl mb-4">Withdraw Money</h2>
              <div className="flex flex-col">
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Enter amount to withdraw"
                  className="mb-4 p-2 border border-gray-300 rounded-md"
                  min="1"
                />
                <button
                  onClick={handleWithdraw}
                  className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  Withdraw
                </button>
              </div>
              {withdrawMessage && <p className="mt-4 text-xl">{withdrawMessage}</p>}
            </div>
        
          </div>
        )
      )}
    </div>
  );
};

export default UDashboard;
