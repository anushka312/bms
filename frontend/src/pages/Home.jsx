import React from 'react';
import { motion } from 'framer-motion';
import home from '/src/assets/home.jpg';
import image1 from '/src/assets/image1.png';
import image2 from '/src/assets/image2.png';
import { useNavigate } from 'react-router-dom';
import { FaArrowDown } from 'react-icons/fa';
import featureImg1 from '/src/assets/feature.png';
import featureImg2 from '/src/assets/feature2.jpg';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* HERO SECTION */}
      <div
        className="w-full min-h-screen bg-white flex items-center justify-center relative overflow-hidden px-8 bg-cover"
        style={{ backgroundImage: `url(${home})` }}
      >
        {/* Left Illustration */}
        <motion.img
          src={image1}
          alt="Finance Illustration Left"
          className="w-1/3 absolute left-0 bottom-44 object-contain pr-2"
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Center Text */}
        <div className="text-center z-30 max-w-2xl">
          <motion.h1
            className="text-5xl md:text-7xl text-black font-bold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            Finance, Simplified with <span className="text-blue-500">Fin</span><span className="text-purple-500">Core</span>
          </motion.h1>
          <p className="mt-4 text-xl text-gray-700">
            Smart tools. Real insights. Total control over your money.
          </p>

          <button
            onClick={() => navigate('/register')}
            className="mt-8 px-6 py-3 bg-black text-white text-lg rounded hover:bg-gray-800 transition"
          >
            Get Started
          </button>
          <div className="mt-6 flex justify-center gap-4">
            <button
              onClick={() => navigate('/ulogin')}
              className="px-5 py-2 border border-black text-black rounded hover:bg-green-700 hover:text-white transition"
            >
              Login as Customer
            </button>
            <button
              onClick={() => navigate('/alogin')}
              className="px-5 py-2 border border-black text-black rounded hover:bg-blue-700 hover:text-white transition"
            >
              Login as Employee
            </button>
          </div>
        </div>

        {/* Right Illustration */}
        <motion.img
          src={image2}
          alt="Finance Illustration Right"
          className="w-1/3 absolute right-0 bottom-36 object-contain pl-4"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        />

        {/* Scroll Indicator */}
        <motion.div
          className="absolute bottom-6 z-20 text-black"
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <FaArrowDown size={24} className="mx-auto animate-pulse" />
        </motion.div>
      </div>

      {/* SECTION 1 - Text Left, Image Right */}
      <div className="bg-white w-full h-screen flex flex-row items-center">
        <div className="w-1/2 pr-8 px-6">
          <h2 className="text-4xl text-black font-semibold mb-6">
            Why choose <span className="text-blue-500">Fin</span><span className="text-purple-500">Core</span>?
          </h2>
          <p className="text-2xl text-gray-700 leading-relaxed">
            Experience seamless banking with FinCore’s intuitive interface and robust tools. From budgeting and goal tracking to real-time analytics, we put your entire financial world at your fingertips.
          </p>
        </div>

        <div className="w-1/2 h-full">
          <img
            src={featureImg1}
            alt="Smart Budgeting Tools"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* SECTION 2 - Image Left, Text Right */}
      <div className="bg-gray-100 w-full h-screen flex flex-row items-center">
        <div className="w-1/2 h-full">
          <img
            src={featureImg2}
            alt="Secure Payments and Support"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="w-1/2 pl-8 px-6">
          <h2 className="text-3xl text-black font-semibold mb-4">
            Smart, Secure & Always Available
          </h2>
          <p className="text-2xl text-gray-700 leading-relaxed">
            Send and receive payments instantly, automate savings, and get personalized financial advice. <br />
            <br />With 24/7 expert support and military-grade security, your peace of mind is our priority.
          </p>
        </div>
      </div>

      {/* FINAL SECTION / Background Reveal */}
      {/* FINAL SECTION / Background Call to Action */}
      <div
        className="w-full h-screen bg-cover flex items-center justify-center text-center px-6"
        style={{ backgroundImage: `url(${home})` }}
      >
        <div className="p-10 ">
          <h2 className="text-4xl md:text-5xl font-bold text-black mb-6">
            Ready to Take Control of Your Finances?
          </h2>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Join thousands who trust <span className="text-blue-500 font-semibold">Fin</span><span className="text-purple-500 font-semibold">Core</span> for smarter budgeting, faster payments, and total peace of mind.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-8 py-4 bg-black text-white text-lg rounded-2xl hover:bg-gray-800 transition "
          >
            Start Your Journey
          </button>
        </div>
      </div>
      {/* FOOTER */}
      <footer className="w-full bg-black text-white text-center py-10 text-sm">
        © {new Date().getFullYear()} FinCore. All rights reserved.
      </footer>

    </div>

  );
};

export default Home;
