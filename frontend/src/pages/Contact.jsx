import React from 'react';
import { motion } from 'framer-motion';
import bgImage from '/src/assets/contact-bg.jpg';

const Contact = () => {
  return (
    <div
      className="w-full min-h-screen bg-cover bg-center flex items-center justify-center px-6 py-20"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <motion.div
        className="bg-white/30 bg-opacity-70 shadow-lg rounded-2xl p-10 max-w-xl w-full text-center backdrop-blur-sm"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        <h1 className="text-4xl font-bold mb-6">
          Contact <span className="text-blue-500">Us</span>
        </h1>
        <p className="text-lg text-gray-700 mb-4">
          Have a question or just want to reach out? We'd love to hear from you.
        </p>

        <div className="mt-8 space-y-4 text-gray-800 text-lg">
          <p>
            📧 <strong>Email:</strong> contact@fincore.com
          </p>
          <p>
            📞 <strong>Phone:</strong> +91 98765 43210
          </p>
          <p>
            📍 <strong>Address:</strong> FinCore HQ, Delhi, India
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Contact;
