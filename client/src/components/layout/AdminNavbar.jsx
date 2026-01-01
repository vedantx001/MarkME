import React, { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import { motion } from 'framer-motion';
import EditAdminProfileForm from '../forms/EditAdminProfileForm';

const AdminNavbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
  const { schoolDetails, adminProfile } = useAdmin();
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  return (
    <>
      <EditAdminProfileForm isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="h-20 bg-(--primary-bg)/80 backdrop-blur-md border-b border-[rgb(var(--primary-accent-rgb)/0.05)] flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0"
      >
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -ml-2 text-(--primary-accent) hover:bg-(--secondary-bg) rounded-lg lg:hidden"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-(--primary-text) leading-tight tracking-tight">
              {schoolDetails.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-(--secondary-accent) bg-(--primary-accent) px-2 py-0.5 rounded-full">
                Index
              </span>
              <span className="text-xs font-semibold text-(--primary-accent) opacity-70">
                {schoolDetails.index}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">

          <div className="h-8 w-px bg-(--primary-accent) opacity-10 hidden md:block"></div>

          <div className="flex items-center gap-3 pl-2 cursor-pointer group" onClick={() => setIsEditProfileOpen(true)} role="button" tabIndex={0}>
            <div className="hidden md:flex flex-col items-end">
              <span className="text-sm font-bold text-(--primary-text) group-hover:text-(--secondary-accent) transition-colors">
                {adminProfile.name}
              </span>
              <span className="text-xs font-medium text-(--primary-accent) opacity-50">
                {adminProfile.email}
              </span>
            </div>
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-(--primary-accent) shadow-md flex items-center justify-center overflow-hidden border-2 border-(--secondary-accent) group-hover:scale-105 transition-transform">
                <img src={adminProfile.avatar} alt="Admin" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-(--secondary-accent) border-2 border-(--primary-bg) rounded-full"></div>
            </div>
            <ChevronDown size={16} className="text-(--primary-accent) opacity-30 hidden md:block group-hover:text-(--secondary-accent) group-hover:opacity-100 transition-all" />
          </div>
        </div>
      </motion.header>
    </>
  );
};

export default AdminNavbar;