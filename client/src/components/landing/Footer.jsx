import React from 'react';
import { Cpu } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="py-12 border-t border-gray-100 px-6">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#2D3748] rounded flex items-center justify-center">
                        <Cpu size={14} className="text-[#85C7F2]" />
                    </div>
                    <span className="heading-font font-bold text-[#2D3748]">MarkME Intelligence</span>
                </div>
                <div className="flex gap-8 text-sm text-gray-400">
                    <a href="#" className="hover:text-[#2D3748] transition-colors cursor-pointer">Privacy Policy</a>
                    <a href="#" className="hover:text-[#2D3748] transition-colors cursor-pointer">Terms of Service</a>
                    <a href="#" className="hover:text-[#2D3748] transition-colors cursor-pointer">Accessibility</a>
                </div>
                <div className="text-sm text-gray-400">
                    © 2025 MarkME Biometrics. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
