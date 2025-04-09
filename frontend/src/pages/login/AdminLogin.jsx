import React from 'react';
import bg from '/src/assets/bg.jpg';
import loginImage from '/src/assets/login-image-2.jpg'; 

const AdminLogin = () => {
  return (
    <div
      className="bg-cover bg-center w-screen h-screen flex items-center justify-center"
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

          <form className="flex flex-col space-y-5">
            <input
              type="email"
              placeholder="Email"
              className="px-4 py-3 bg-[#e8e5e5] placeholder-black/60 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              className="px-4 py-3 bg-[#e8e5e5] placeholder-black/60 text-white border border-white/30 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              className="bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700 transition"
            >
              Sign In
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-slate-950">
            Having trouble? <span className="text-blue-400 hover:underline cursor-pointer">Contact IT Support</span>
          </p>
        </div>

        {/* Right Side - Image (now on right, no shadow or zoom) */}
        <div className="hidden md:flex w-1/2 bg-transparent pl-20">
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
