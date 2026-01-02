// src/components/attendance/AttendanceCell.jsx
import { motion as Motion, AnimatePresence } from "framer-motion";

const AttendanceCell = ({ status, onToggle }) => {
  const isPresent = status === "P";
  const isAbsent = status === "A";

  // Dynamic Styles based on Status using your CSS variables
  const getStatusStyles = () => {
    if (isPresent) return "bg-green-300 border-2 border-green-800 text-(--primary-text) shadow-md shadow-[#85C7F2]/20";
    if (isAbsent) return "bg-red-300 border-2 border-red-800 text-(--primary-text) shadow-md shadow-[#2D3748]/10";
    return "bg-[var(--secondary-bg)] text-[var(--primary-text)]/40 border border-dashed border-[var(--secondary-accent)]/30";
  };

  return (
    <Motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={onToggle}
      style={{ cursor: 'pointer' }}
      className={`
        w-12 h-10 md:w-14 md:h-11 rounded-xl 
        flex items-center justify-center
        transition-all duration-200
        font-jakarta font-bold text-sm md:text-base
        ${getStatusStyles()}
      `}
      title="Click to toggle (P/A)"
    >
      <AnimatePresence mode="wait">
        <Motion.span
          key={status}
          initial={{ opacity: 0, scale: 0.5, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -5 }}
          transition={{ duration: 0.15 }}
        >
          {isPresent ? "P" : isAbsent ? "A" : "?"}
        </Motion.span>
      </AnimatePresence>
    </Motion.button>
  );
};

export default AttendanceCell;
