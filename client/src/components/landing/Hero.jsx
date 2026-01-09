// src/components/landing/Hero.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from './Background';
import HeroCube from './HeroCube';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-28 sm:pt-32 lg:pt-40 pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 overflow-hidden">
            <Background />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-6 items-center">
                <div className="order-1 lg:order-1 max-w-3xl mx-auto lg:mx-0 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center justify-center lg:justify-start gap-2 px-3 py-1 rounded-full bg-[#F2F8FF] border border-[#85C7F2]/30 text-[#2D3748] text-xs font-semibold mb-6 mx-auto lg:mx-0"
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-[#85C7F2] animate-pulse"></span>
                        Government‑Grade • Built for Public Schools
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="heading-font text-5xl md:text-7xl font-bold leading-[1.1] mb-8 text-[#2D3748]"
                    >
                        Smart Attendance Solutions for Rural Schools.
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg md:text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl"
                    >
                        An AI‑powered attendance system designed for government and rural schools. Eliminate manual registers with secure face recognition that ensures accuracy, efficiency, and ease of use for teachers.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <button
                            onClick={() => navigate('/auth')}
                            className="w-full sm:w-auto px-8 py-4 bg-[#85C7F2] text-[#2D3748] font-bold rounded-xl hover:shadow-lg hover:shadow-[#85C7F2]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Start Using MarkME <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </div>

                {/* Right side - 3D Hyper-Structure */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 1, ease: 'easeOut' }}
                    className="order-2 lg:order-2 w-full max-w-md sm:max-w-lg mx-auto lg:mx-0"
                >
                    <HeroCube />
                </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
