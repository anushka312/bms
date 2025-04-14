import React from 'react';
import { motion } from 'framer-motion';
import aboutImg from '/src/assets/about.jpg';

const About = () => {
    return (
        <div className="w-full min-h-screen bg-white text-black">
            {/* HERO SECTION */}
            <div
                className="w-full h-[80vh] bg-cover bg-center flex items-center justify-center px-6"
                style={{ backgroundImage: `url(${aboutImg})` }}
            >
                <motion.div
                    className="p-10 mt-20 text-center max-w-3xl bg-white bg-opacity-80 rounded-xl"
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1 }}
                >
                    <h1 className="text-5xl font-bold mb-4">
                        About <span className="text-blue-500">Fin</span><span className="text-purple-500">Core</span>
                    </h1>
                    <p className="text-xl text-gray-800 font-bold">
                        Empowering your financial future—one smart decision at a time.
                    </p>
                </motion.div>
            </div>

            {/* OUR MISSION */}
            <div className="py-20 px-6 md:px-2 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center ">
                    <h2 className="text-4xl font-semibold mb-6">Our Mission</h2>
                    <p className="text-xl text-gray-700 leading-relaxed">
                        Our mission is to help people thrive financially. Whether you're just starting your savings journey or optimizing your investments, FinCore equips you with real-time insights, automation, and expert guidance—all in one seamless experience.
                    </p>
                </div>
            </div>

            {/* JOIN US CTA */}
            <div className="py-20 px-6 md:px-20 bg-white">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">
                    {/* LEFT - TEXT CONTENT */}
                    <div className="flex-1">
                        <h2 className="text-3xl font-bold mb-4">Join the FinCore Movement</h2>
                        <p className="text-lg text-gray-700 mb-6">
                            Be part of a growing community that's redefining what financial freedom looks like. Take the first step today.
                        </p>
                        <a
                            href="/register"
                            className="inline-block px-8 py-4 bg-black text-white rounded-xl text-lg hover:bg-gray-800 transition"
                        >
                            Get Started
                        </a>
                    </div>

                    {/* RIGHT - IMAGE */}
                    <div className="flex-1">
                        <img
                            src="/src/assets/join.png" 
                            alt="Join FinCore"
                            className=" pl-40 object-cover"
                        />
                    </div>
                </div>
            </div>



            {/* FOOTER */}
            <footer className="w-full bg-black text-white text-center py-4 text-sm">
                © {new Date().getFullYear()} FinCore. All rights reserved.
            </footer>
        </div>
    );
};

export default About;
