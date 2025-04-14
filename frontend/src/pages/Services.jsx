import React from 'react';
import { motion } from 'framer-motion';
import serviceImg1 from '/src/assets/service1.jpg';
import serviceImg2 from '/src/assets/feature.png';
import serviceImg3 from '/src/assets/feature2.jpg';
import serviceImg4 from '/src/assets/image1(1).png';

const Services = () => {
  return (
    <div className="w-full min-h-screen bg-white text-black">
      {/* HERO SECTION */}
      <div className="w-full h-[80vh] bg-cover bg-center flex items-center justify-center px-6" style={{ backgroundImage: `url(${serviceImg1})` }}>
        <motion.div
          className="p-10 text-center max-w-3xl bg-white bg-opacity-90 rounded-xl"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          <h1 className="text-5xl font-bold mb-4">
            Our <span className="text-blue-500">Services</span>
          </h1>
          <p className="text-lg text-gray-800">
            Empowering your financial journey with cutting-edge tools and expert insights.
          </p>
        </motion.div>
      </div>

      {/* SERVICE 1 */}
      <div className="py-20 px-6 md:px-20 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-semibold mb-6">Smart Budgeting Tools</h2>
          <p className="text-xl text-gray-700 leading-relaxed mb-6">
            Our budgeting tools allow you to set realistic goals, track your expenses, and visualize your spending habits. Stay on top of your financial health effortlessly.
          </p>
          <img
            src={serviceImg4}
            alt="Budgeting Tools"
            className="w-full h-72 object-cover rounded-xl shadow-lg"
          />
        </div>
      </div>

      {/* SERVICE 2 */}
<div className="py-20 px-6 md:px-20 bg-gray-100">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-4xl font-semibold mb-6">Instant Payments & Transfers</h2>
    <p className="text-xl text-gray-700 leading-relaxed mb-14">
      Send and receive payments instantly, no matter where you are. Our secure and fast payment system makes money transfers simple and reliable.
    </p>
    <img
      src={serviceImg2}
      alt="Instant Payments"
      className="w-full h-72 object-cover rounded-xl shadow-lg"
      style={{ marginTop: "-40px" }}
    />
  </div>
</div>

{/* SERVICE 3 */}
<div className="py-20 px-6 md:px-20 bg-white">
  <div className="max-w-4xl mx-auto text-center">
    <h2 className="text-4xl font-semibold mb-6">Personalized Financial Advice</h2>
    <p className="text-xl text-gray-700 leading-relaxed mb-14">
      Our expert financial advisors provide personalized insights and strategies to help you make smarter, more informed financial decisions.
    </p>
    <img
      src={serviceImg3}
      alt="Financial Advice"
      className="w-full h-72 object-cover rounded-xl shadow-lg"
      style={{ marginTop: "-40px" }}
    />
  </div>
</div>

      {/* CALL TO ACTION */}
      <div className="py-20 px-6 md:px-20 bg-gray-100 text-center">
        <h2 className="text-3xl font-bold mb-4">Start Your Financial Journey Today</h2>
        <p className="text-lg text-gray-700 mb-6">
          Ready to take control of your finances? Join thousands of satisfied users who trust FinCore for smarter financial management.
        </p>
        <a
          href="/register"
          className="inline-block px-8 py-4 bg-black text-white rounded-xl text-lg hover:bg-gray-800 transition"
        >
          Get Started
        </a>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-black text-white text-center py-4 text-sm">
        © {new Date().getFullYear()} FinCore. All rights reserved.
      </footer>
    </div>
  );
};

export default Services;
