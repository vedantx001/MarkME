// src/components/common/Navbar.jsx
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import { LogOut, User, Bell, Menu } from "lucide-react";
import { useAuth } from "../../context/authContext";

const getPageTitle = (pathname) => {
  if (pathname.startsWith("/teacher/student/")) return "Student Details";
  if (pathname === "/teacher/attendance") return "Attendance Hub";
  if (pathname === "/teacher/classroom") return "Classroom Overview";
  if (pathname === "/principal/dashboard") return "Dashboard";
  if (pathname === "/principal/teachers") return "Teachers";
  if (pathname === "/principal/classrooms") return "Classrooms";
  if (pathname.startsWith("/principal/classrooms/")) return "Classroom Overview";
  if (pathname.startsWith("/principal/student/")) return "Student Details";
  return "Dashboard";
};

const Navbar = ({ toggleSidebar }) => {
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  const { user, logout } = useAuth();
  const displayName = user?.name || "—";
  const roleLabel = user?.role ? String(user.role).toUpperCase() : "";

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-40 h-16 bg-(--primary-bg) border-b border-(--secondary-bg) px-4 md:px-8 flex items-center justify-between "
    >
      {/* Left: Dynamic Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 mr-2 text-(--primary-text)/40 hover:text-(--secondary-accent) transition-colors rounded-lg hover:bg-(--secondary-bg)/50 lg:block"
          style={{ cursor: "pointer" }}
        >
          <Menu size={24} />
        </button>
        <div className="h-6 w-1 bg-(--secondary-accent) rounded-full hidden md:block" />
        <h2 className="font-jakarta text-lg md:text-xl font-bold text-(--primary-text) tracking-tight">
          {title}
        </h2>
      </div>

      {/* Right Section: Profile & Actions */}
      <div className="flex items-center gap-2 md:gap-6">
        {/* User Info Container */}
        <div className="flex items-center gap-3 pl-4 border-l border-(--secondary-bg)">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-(--primary-text) leading-none">
              {displayName}
            </p>
            <p className="text-[10px] text-(--primary-text)/40 uppercase font-black mt-1">
              {roleLabel || "USER"}
            </p>
          </div>

          <div className="h-9 w-9 rounded-full bg-(--secondary-bg) flex items-center justify-center border border-(--secondary-accent)/20 text-(--secondary-accent)">
            <User size={20} />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ml-2 p-2 md:px-3 md:py-1.5 rounded-lg bg-(--primary-accent) text-white flex items-center gap-2 hover:bg-(--primary-text) transition-all shadow-sm"
            style={{ cursor: 'pointer' }}
            onClick={logout}
          >
            <LogOut size={16} />
            <span className="hidden md:inline text-xs font-bold uppercase tracking-wider">Logout</span>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;