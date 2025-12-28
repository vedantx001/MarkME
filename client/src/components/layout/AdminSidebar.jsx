import React from 'react';
import { Users, School, LayoutDashboard, Settings, LogOut } from 'lucide-react';
import { useAdmin } from '../../context/adminContext';
import { useAuth } from '../../context/authContext';
import { useLocation, useNavigate } from 'react-router-dom';

const SidebarItem = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${ active ? 'bg-[#2D3748] text-[#FBFDFF] shadow-lg shadow-[#2D3748]/20' : 'text-[#2D3748]/70 hover:bg-[#F2F8FF] hover:text-[#0E0E11]' }`}
  >
    <Icon 
      size={20} 
      className={active ? 'text-[#85C7F2]' : 'text-[#2D3748]/50 group-hover:text-[#2D3748]'} 
    />
    <span className="font-medium">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#85C7F2]" />}
  </button>
);

const AdminSidebar = ({ isMobile, isMobileMenuOpen }) => {
  const { adminProfile } = useAdmin();
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const goTo = (path) => {
    navigate(path);

    // close mobile overlay after navigation
    if (isMobile) {
      // mobile menu state lives in AdminLayout; simplest is to rely on route change rerender.
      // If you later pass a setter, call it here.
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", to: "/admin/dashboard" },
    { icon: Users, label: "Teachers", to: "/admin/teachers" },
    { icon: School, label: "Classrooms", to: "/admin/classrooms" },
    { icon: Users, label: "Principal", to: "/admin/principal" },
  ].map((item) => ({
    ...item,
    active: currentPath === item.to || (item.to === '/admin/dashboard' && currentPath === '/admin'),
    onClick: () => goTo(item.to),
  }));

  const content = (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-[#0E0E11] flex items-center justify-center">
          <School className="text-[#85C7F2]" size={20} />
        </div>
        <span className="text-xl font-bold text-[#0E0E11]">
          EduAdmin
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <SidebarItem key={item.label} {...item} />
        ))}
        <div className="pt-8 pb-2 px-4 text-xs font-bold text-[#2D3748]/40 uppercase tracking-wider">
          System
        </div>
        <SidebarItem icon={Settings} label="Settings" />
      </nav>

      <div className="mt-auto pt-6 border-t border-[#2D3748]/5">
        <button
          onClick={async () => {
            await logout();
            navigate('/login', { replace: true });
          }}
          className="flex items-center gap-3 px-4 py-3 text-[#2D3748]/60 hover:text-[#0E0E11] hover:bg-[#F2F8FF] rounded-xl w-full transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>

      {isMobile && (
        <div className="mt-6 border-t border-[#2D3748]/10 pt-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#2D3748] overflow-hidden">
            <img src={adminProfile.avatar} alt="Mobile Profile" />
          </div>
          <div>
            <p className="font-bold text-[#0E0E11]">{adminProfile.name}</p>
            <p className="text-xs text-[#2D3748]/60">{adminProfile.email}</p>
          </div>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    if (!isMobileMenuOpen) return null;
    return (
      <div className="lg:hidden absolute top-20 left-0 w-full h-[calc(100%-5rem)] bg-[#FBFDFF] z-20 p-6 flex flex-col shadow-2xl">
        {content}
      </div>
    );
  }

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-[#FBFDFF] border-r border-[#2D3748]/5 h-full p-6">
      {content}
    </aside>
  );
};

export default AdminSidebar;