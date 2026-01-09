// src/components/landing/Footer.jsx
import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-gray-100 py-10 sm:py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-8">
                {/* Brand + Description */}
                <div className="w-full md:max-w-md">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <div className="bg-[#2D3748] rounded flex items-center justify-center">
                            <img className="w-10 h-11 rounded-md" src="/markme.png" alt="MarkME logo" />
                        </div>
                        <span className="heading-font text-xl font-bold text-[#2D3748]">
                            Mark<span className="text-[#85C7F2]">ME</span>
                        </span>
                    </div>

                    <p className="mt-4 text-sm text-center md:text-left text-gray-400 leading-relaxed hover:text-[#2D3748] transition-colors">
                        A smart attendance management platform for government and rural schools, powered by secure face recognition and centralized reporting.
                    </p>
                </div>

                {/* Copyright */}
                <div className="text-sm w-full text-center md:w-auto md:text-right text-gray-400 md:whitespace-nowrap hover:text-[#2D3748] transition-colors">
                    © 2026 MarkME. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
