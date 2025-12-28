// src/components/landing/Navbar.jsx
import React, { useState } from 'react';
import { Cpu, Menu, X } from 'lucide-react';
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
                    <div className="w-8 h-8 bg-[#2D3748] rounded-lg flex items-center justify-center">
                        <Cpu size={18} className="text-[#85C7F2]" />
                    </div>
                    <span className="heading-font text-xl font-bold tracking-tight text-[#2D3748]">MarkME</span>
                </div>

                <div className="hidden md:flex items-center gap-8">
                    <a href="#workflow" className="text-sm font-medium hover:text-[#85C7F2] transition-colors cursor-pointer">Workflow</a>
                    <a href="#features" className="text-sm font-medium hover:text-[#85C7F2] transition-colors cursor-pointer">Features</a>
                    <a href="#roles" className="text-sm font-medium hover:text-[#85C7F2] transition-colors cursor-pointer">Solutions</a>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-5 py-2.5 bg-[#2D3748] text-white text-sm font-semibold rounded-lg hover:bg-[#1a202c] transition-all cursor-pointer"
                    >
                        Request Demo
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
