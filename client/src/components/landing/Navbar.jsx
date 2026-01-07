// src/components/landing/Navbar.jsx
import React, { useState } from 'react';
import { Cpu, Menu, X, Bot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed w-full z-50 bg-[#FDFBFF]/80 backdrop-blur-md border-b border-gray-100"
        >
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* <div className="w-8 h-8 bg-[#2D3748] rounded-lg flex items-center justify-center">
                        <Bot size={18} className="text-[#85C7F2]" />
                    </div> */}
                    <img className='w-14 h-15 rounded-md' src="/markme.png" alt="Logo" />
                    <span className="heading-font text-4xl font-bold tracking-tight text-[#2D3748]">Mark<span className="text-[#85C7F2]">ME</span></span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a
                        href="#workflow"
                        className="relative text-sm font-medium cursor-pointer transition-colors hover:text-[#85C7F2] after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1.5 after:h-0.5 after:w-full after:bg-[#85C7F2] after:scale-x-0 after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100"
                    >
                        Workflow
                    </a>
                    <a
                        href="#features"
                        className="relative text-sm font-medium cursor-pointer transition-colors hover:text-[#85C7F2] after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1.5 after:h-0.5 after:w-full after:bg-[#85C7F2] after:scale-x-0 after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100"
                    >
                        Features
                    </a>
                    <a
                        href="#roles"
                        className="relative text-sm font-medium cursor-pointer transition-colors hover:text-[#85C7F2] after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1.5 after:h-0.5 after:w-full after:bg-[#85C7F2] after:scale-x-0 after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100"
                    >
                        Solutions
                    </a>
                    <a
                        href="#developers"
                        className="relative text-sm font-medium cursor-pointer transition-colors hover:text-[#85C7F2] after:content-[''] after:absolute after:left-1/2 after:-translate-x-1/2 after:-bottom-1.5 after:h-0.5 after:w-full after:bg-[#85C7F2] after:scale-x-0 after:origin-center after:transition-transform after:duration-300 hover:after:scale-x-100"
                    >
                        Developers
                    </a>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2.5 bg-[#2D3748] text-white text-sm font-semibold rounded-lg hover:bg-[#1a202c] transition-all cursor-pointer"
                    >
                        Login
                    </button>
                </div>

                <button className="md:hidden cursor-pointer" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </motion.nav>
    );
};

export default Navbar;
