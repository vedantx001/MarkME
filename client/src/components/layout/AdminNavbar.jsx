import React from 'react';
import { Search, Bell, Menu, X, ChevronDown } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';

const AdminNavbar = ({ isMobileMenuOpen, setIsMobileMenuOpen }) => {
const { schoolDetails, adminProfile } = useAdmin();

return (
<header className="h-20 bg-[#FBFDFF]/80 backdrop-blur-md border-b border-[#2D3748]/5 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
<div className="flex items-center gap-4">
<button
onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
className="p-2 -ml-2 text-[#2D3748] hover:bg-[#F2F8FF] rounded-lg lg:hidden"
>
{isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
</button>

    <div className="flex flex-col justify-center">
      <h1 className="text-xl font-bold text-[#0E0E11] leading-tight tracking-tight">
        {schoolDetails.name}
      </h1>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#85C7F2] bg-[#2D3748] px-2 py-0.5 rounded-full">
          Index
        </span>
        <span className="text-xs font-semibold text-[#2D3748]/70">
          {schoolDetails.index}
        </span>
      </div>
    </div>
  </div>

  <div className="flex items-center gap-4 lg:gap-6">
    <div className="hidden md:flex items-center gap-3">
       <button className="p-2 text-[#2D3748]/40 hover:text-[#2D3748] transition-colors">
         <Search size={20} />
       </button>
       <button className="relative p-2 text-[#2D3748]/40 hover:text-[#2D3748] transition-colors">
         <Bell size={20} />
         <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#85C7F2] rounded-full border-2 border-[#FBFDFF]"></span>
       </button>
    </div>

    <div className="h-8 w-[1px] bg-[#2D3748]/10 hidden md:block"></div>

    <div className="flex items-center gap-3 pl-2 cursor-pointer group">
      <div className="hidden md:flex flex-col items-end">
        <span className="text-sm font-bold text-[#0E0E11] group-hover:text-[#85C7F2] transition-colors">
          {adminProfile.name}
        </span>
        <span className="text-xs font-medium text-[#2D3748]/50">
          {adminProfile.email}
        </span>
      </div>
      <div className="relative">
        <div className="w-10 h-10 rounded-full bg-[#2D3748] shadow-md flex items-center justify-center overflow-hidden border-2 border-[#85C7F2] group-hover:scale-105 transition-transform">
          <img src={adminProfile.avatar} alt="Admin" className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#85C7F2] border-2 border-[#FBFDFF] rounded-full"></div>
      </div>
      <ChevronDown size={16} className="text-[#2D3748]/30 hidden md:block group-hover:text-[#2D3748]" />
    </div>
  </div>
</header>


);
};

export default AdminNavbar;