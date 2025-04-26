import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const UDashboard = () => {
  const { user } = useAuth();
  const [account, setAccount] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBalanceVisible, setIsBalanceVisible] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [depositMessage, setDepositMessage] = useState('');
  const [withdrawMessage, setWithdrawMessage] = useState('');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferMessage, setTransferMessage] = useState('');

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
    try {
      await axios.post('http://localhost:5000/account/', {
        customer_id: user.customer_id
      });
      alert('Savings Account created successfully!');
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
      if (parseFloat(withdrawAmount) > account.balance) {
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

  const handleSendMoney = async () => {
    setTransferMessage('');
    if (!receiverAccount || !transferAmount || transferAmount <= 0) {
      setTransferMessage('Please fill all fields with valid values.');
      return;
    }

    if (receiverAccount === account.account_number) {
      setTransferMessage("You can't send money to your own account.");
      return;
    }

    const amount = parseFloat(transferAmount);
    if (amount > account.balance) {
      setTransferMessage('Insufficient balance.');
      return;
    }

    try {
      // 1. Subtract from sender
      await axios.put(`http://localhost:5000/account/${account.account_number}`, {
        balance: account.balance - amount,
        amount: -amount, // negative amount for sender
        receiver_account: parseInt(receiverAccount)
      });

      // 2. Add to receiver
      await axios.put(`http://localhost:5000/account/${receiverAccount}`, {
        balance: null, // assume backend recalculates balance
        amount: amount, // positive amount for receiver
        receiver_account: parseInt(receiverAccount)
      });

      // OR (if backend does both in one transaction)
      // await axios.post('http://localhost:5000/transaction/', {
      //   sender_account: parseInt(account.account_number),
      //   receiver_account: parseInt(receiverAccount),
      //   amount: amount // backend should apply -amount to sender and +amount to receiver
      // });

      setTransferMessage('Transfer successful!');
      setReceiverAccount('');
      setTransferAmount('');
      fetchAccount();
    } catch (err) {
      console.error('Error sending money:', err);
      setTransferMessage('Transfer failed.');
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
                <label className="block mb-5 text-2xl">Create a savings account instantly!</label>
                <button
                  onClick={createAccount}
                  className="w-full text-lg bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Create Savings Account
                </button>
              </div>

              <span className="text-xl font-semibold">OR</span>

              <div className="bg-white p-6 rounded-md shadow-md w-2/6 bg-white/30 bg-opacity-50">
                <label className="block mb-5 text-2xl">Tap here to get a loan in seconds!</label>
                <button
                  onClick={goToLoanPage}
                  className="w-full text-lg bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                >
                  Apply for Loan
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {/* Upper Row - Account Info and Send Money */}
            <div className="flex flex-row justify-center gap-5">
              {/* Account Info */}
              <div className="bg-white shadow-md rounded-xl p-6 py-16 my-4 max-w-md w-1/2 text-2xl">
                <h1 className='font-bold text-3xl mb-4'>Account Info</h1>
                <p className="flex items-center justify-between mb-4">
                  <span>Account Number: {account.account_number}</span>
                </p>
                <p className="flex items-center justify-between mt-2">
                  <span>
                    <span> Balance: ₹ {isBalanceVisible ? account.balance : '••••••'} </span>
                    <button
                      onClick={toggleBalanceVisibility}
                      className="ml-2"
                    >
                      {isBalanceVisible ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </span>
                </p>
              </div>

              {/* Send Money */}
              <div className="bg-white shadow-md rounded-xl p-6 my-4 max-w-md w-1/2 text-xl">
                <h2 className="text-2xl mb-4">Send Money</h2>
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={receiverAccount}
                    onChange={(e) => setReceiverAccount(e.target.value)}
                    placeholder="Receiver's account number"
                    className="mb-4 p-2 border border-gray-300 rounded-md"
                  />
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Amount to send"
                    className="mb-4 p-2 border border-gray-300 rounded-md"
                    min="1"
                  />
                  <button
                    onClick={handleSendMoney}
                    className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
                  >
                    Send Money
                  </button>
                </div>
                {transferMessage && <p className="mt-4 text-xl">{transferMessage}</p>}
              </div>
            </div>

            {/* Bottom Row - Deposit and Withdraw */}
            <div className="flex flex-row justify-center gap-5">
              {/* Deposit */}
              <div className="bg-white shadow-md rounded-xl p-6 my-4 max-w-md w-1/2 text-xl">
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

              {/* Withdraw */}
              <div className="bg-white shadow-md rounded-xl p-6 my-4 max-w-md w-1/2 text-xl">
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
          </div>
        )
      )}
    </div>
  );
};

export default UDashboard;
