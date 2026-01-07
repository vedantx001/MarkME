// src/components/landing/Hero.jsx
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Background from './Background';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative pt-40 pb-24 px-6 overflow-hidden">
            <Background />
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F2F8FF] border border-[#85C7F2]/30 text-[#2D3748] text-xs font-semibold mb-6"
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
                        className="flex flex-col sm:flex-row gap-4"
                    >
                        <button
                            onClick={() => navigate('/auth')}
                            className="px-8 py-4 bg-[#85C7F2] text-[#2D3748] font-bold rounded-xl hover:shadow-lg hover:shadow-[#85C7F2]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                        >
                            Start Using MarkME <ArrowRight size={18} />
                        </button>
                    </motion.div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
