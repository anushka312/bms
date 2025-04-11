import React, { useState } from 'react';
import register from '/src/assets/register.jpg';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext'; 

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        customer_name: '',
        customer_street: '',
        customer_city: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const { login } = useAuth();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/customer/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();
            console.log("Registered user data:", data);

            if (response.ok) {
                alert('Registration successful!');
                login(data.user); 
                navigate('/uhome');
            } else {
                alert(`Error: ${data.message || 'Something went wrong'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Something went wrong while connecting to the server.');
        }
    };

    return (
        <div
            className='w-screen h-screen bg-cover flex items-center justify-center'
            style={{ backgroundImage: `url(${register})` }}
        >
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-6xl px-7">
                {/* Left Side: Text */}
                <div className='text-black md:w-1/2 text-center md:text-left mb-12 md:mb-0'>
                    <motion.h1
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1 }}
                        className="text-5xl md:text-7xl "
                    >
                        Come Join Us!
                    </motion.h1>

                    <motion.h2
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="text-2xl md:text-3xl mt-4"
                    >
                        and become a part of the revolution
                    </motion.h2>
                </div>

                {/* Right Side: Form */}
                <div className="bg-white bg-opacity-20 backdrop-blur-lg p-8 rounded-lg shadow-lg w-full max-w-md mt-6 md:mt-16">
                    <h3 className="text-center text-2xl font-bold text-black mb-4">Registration</h3>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="customer_name"
                            value={formData.customer_name}
                            onChange={handleChange}
                            placeholder="Full Name"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="customer_street"
                            value={formData.customer_street}
                            onChange={handleChange}
                            placeholder="Street"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="text"
                            name="customer_city"
                            value={formData.customer_city}
                            onChange={handleChange}
                            placeholder="City"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Email"
                            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        
                        {/* Password field with toggle */}
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                onClick={() => setShowPassword(prev => !prev)}
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>

                        {/* Confirm password field with toggle */}
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                className="w-full px-4 py-2 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            />
                            <span
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-600"
                                onClick={() => setShowConfirmPassword(prev => !prev)}
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </span>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
                        >
                            Register
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Register;
