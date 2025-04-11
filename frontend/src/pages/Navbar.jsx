import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full fixed top-0 z-50 bg-white/10 backdrop-blur-xl shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Left Section (Logo + Nav Links) */}
        <div className="flex items-center space-x-12">
          <div className="text-white text-2xl font-bold tracking-wider drop-shadow-sm">
            Logo
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-[#8b282864] text-lg font-medium hover:text-[#37969b] transition duration-200">Home</Link>
            <Link to="/about" className="text-[#8b282864] text-lg font-medium hover:text-[#37969b] transition duration-200">About</Link>
            <Link to="/services" className="text-[#8b282864] text-lg font-medium hover:text-[#37969b] transition duration-200">Services</Link>
            <Link to="/contact" className="text-[#8b282864] text-lg font-medium hover:text-[#37969b] transition duration-200">Contact</Link>
          </nav>
        </div>

        {/* Right Section (Button) */}
        <div>
          <button
            className="relative overflow-hidden rounded-full px-6 py-2 font-semibold text-white shadow-lg
             hover:brightness-110 transition duration-300 group"
            onClick={() => navigate('/register')}
          >
            <span
              className="absolute inset-0 animate-gradient-x bg-gradient-to-r from-[#00FFA3] via-[#DC1FFF] to-[#00FFA3]
               bg-[length:300%_300%] group-hover:scale-105 transition-transform duration-300"
            ></span>
            <span className="relative z-10">Join Us</span>
          </button>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
