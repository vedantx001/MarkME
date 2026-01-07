// src/components/landing/Footer.jsx
import React from 'react';
import { Cpu } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-gray-100 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">

                {/* Brand + Description */}
                <div className="max-w-md">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="bg-[#2D3748] rounded flex items-center justify-center">
                            <img className='w-10 h-11 rounded-md' src="/markme.png" alt="Logo" />
                        </div>
                        <span className="heading-font font-bold text-[#2D3748]">
                            MarkME 
                        </span>
                    </div>

                    <p className="text-sm text-gray-400 pl-12 leading-relaxed hover:text-[#2D3748] transition-colors">
                        A smart attendance management platform for government and rural schools, powered by secure face recognition and centralized reporting.
                    </p>
                </div>

                {/* Footer Links */}
                <div className="flex gap-8 text-sm text-gray-400">
                    <a href="#" className="hover:text-[#2D3748] transition-colors cursor-pointer">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-[#2D3748] transition-colors cursor-pointer">
                        Terms & Conditions
                    </a>
                    <a href="#" className="hover:text-[#2D3748] transition-colors cursor-pointer">
                        Accessibility Statement
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-sm text-gray-400 whitespace-nowrap hover:text-[#2D3748] transition-colors">
                    © 2026 MarkME. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
