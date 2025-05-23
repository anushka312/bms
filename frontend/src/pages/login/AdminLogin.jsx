import React, { useState } from 'react';
import bg from '/src/assets/bg.jpg';
import loginImage from '/src/assets/login-image-2.jpg';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

const AdminLogin = () => {
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);  // For showing loading state
  const [error, setError] = useState(''); // For handling errors

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload

    // Input validation
    if (!email || !password) {
      setError("Email and Password are required.");
      return;
    }
    setError(''); // Clear previous error
    setLoading(true);  // Set loading to true while fetching

    try {
      const response = await fetch('http://localhost:5000/employee/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Assuming the response contains both user and employee data
        alert('Login successful');
        login(data.employee);

        login(data.employee);
        navigate('/ahome');  // Navigate to Admin Home page
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Server error, please try again later');
    } finally {
      setLoading(false); // Set loading to false once done
    }
  };

  return (
    <div
      className="bg-cover bg-center w-screen h-screen flex items-center justify-center pt-10"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Outer Card Container */}
      <div className="w-full max-w-5xl h-[80vh] flex overflow-hidden text-white">

        {/* Left Side - Glassy Form */}
        <div className="w-full md:w-1/2 bg-white bg-opacity-20 backdrop-blur-md p-12 flex flex-col rounded-2xl shadow-xl border border-white/20 justify-center">
          <h2 className="text-3xl font-bold mb-4 text-center text-blue-700">Employee Portal</h2>
          <p className="text-center mb-6 text-white/80 text-md">
            Please log in using your given credentials.
          </p>

          {/* Display Error Message */}
          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col space-y-5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="px-4 py-3 bg-[#e8e5e588] placeholder-black/60 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="px-4 py-3 bg-[#e8e5e588] placeholder-black/60 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition"
              disabled={loading} // Disable button when loading
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-slate-950">
            Having trouble? <span className="text-blue-400 hover:underline cursor-pointer">Contact IT Support</span>
          </p>
        </div>

        {/* Right Side - Image*/}
        <div className="hidden md:flex w-8/12 bg-transparent pl-20">
          <img
            src={loginImage}
            alt="Employee Portal Visual"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
