import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ sidebarItems, brandLabel, showSettings }) => {
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

return (
<div className="flex h-screen bg-[#F2F8FF] font-sans text-[#2D3748] overflow-hidden">

  {/* Desktop Sidebar */}
  <AdminSidebar isMobile={false} items={sidebarItems} brandLabel={brandLabel} showSettings={showSettings} />

  {/* Main Content Area */}
  <main className="flex-1 flex flex-col h-full overflow-hidden relative">
    
    {/* Navbar */}
    <AdminNavbar 
      isMobileMenuOpen={isMobileMenuOpen} 
      setIsMobileMenuOpen={setIsMobileMenuOpen} 
    />

    {/* Mobile Sidebar (Overlay) */}
    <AdminSidebar 
      isMobile={true} 
      isMobileMenuOpen={isMobileMenuOpen} 
      items={sidebarItems}
      brandLabel={brandLabel}
      showSettings={showSettings}
    />

    {/* Page Content Slot */}
    <div className="flex-1 overflow-y-auto p-6 lg:p-10 pb-20">
      <Outlet />
    </div>
  </main>
</div>


);
};

export default AdminLayout;