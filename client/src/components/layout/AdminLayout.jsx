import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminNavbar from './AdminNavbar';
import AdminSidebar from './AdminSidebar';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLayout = ({ sidebarItems, brandLabel, showSettings }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen bg-(--secondary-bg) font-sans text-(--primary-accent) overflow-hidden">
      {/* Desktop Sidebar (hidden below lg) */}
      <div className="hidden lg:flex">
        <AdminSidebar
          isMobile={false}
          items={sidebarItems}
          brandLabel={brandLabel}
          showSettings={showSettings}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Navbar */}
        <AdminNavbar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

        {/* Mobile Sidebar (Overlay) */}
        <AdminSidebar
          isMobile={true}
          isMobileMenuOpen={isMobileMenuOpen}
          items={sidebarItems}
          brandLabel={brandLabel}
          showSettings={showSettings}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        {/* Page Content Slot */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-2 lg:p-10 pb-20">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;