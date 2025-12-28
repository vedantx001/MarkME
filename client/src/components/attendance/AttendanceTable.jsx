// src/components/attendance/AttendanceTable.jsx

import AttendanceCell from "./AttendanceCell";
import { motion } from "framer-motion";

const AttendanceTable = ({ data, onToggle }) => {
  return (
    <div className="w-full bg-(--primary-bg) rounded-2xl border border-(--secondary-bg) overflow-hidden shadow-sm">
      {/* Desktop Table Header (Hidden on Mobile) */}
      <div className="hidden md:grid grid-cols-12 bg-(--primary-bg) border-b border-(--secondary-bg) px-6 py-4">
        <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-(--primary-text)/40">
          Roll No
        </div>
        <div className="col-span-7 text-xs font-bold uppercase tracking-widest text-(--primary-text)/40">
          Student Name
        </div>
        <div className="col-span-3 text-center text-xs font-bold uppercase tracking-widest text-(--primary-text)/40">
          Status
        </div>
      </div>

      {/* Mobile Table Header */}
      <div className="grid md:hidden grid-cols-12 bg-(--primary-bg) border-b border-(--secondary-bg) px-4 py-3">
        <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-(--primary-text)/40">
          Roll No
        </div>
        <div className="col-span-7 text-[10px] font-bold uppercase tracking-widest text-(--primary-text)/40">
          Student Name
        </div>
        <div className="col-span-2 text-right text-[10px] font-bold uppercase tracking-widest text-(--primary-text)/40">
          Status
        </div>
      </div>

      <div className="divide-y divide-(--secondary-bg)">
        {data.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="grid grid-cols-12 items-center px-4 py-3 md:px-6 md:py-3 hover:bg-(--primary-bg) transition-colors"
          >
            {/* Roll No */}
            <div className="col-span-3 md:col-span-2 flex items-center gap-2">
              <span className="text-sm font-bold text-(--primary-accent)">
                {student.rollNo.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Name Column */}
            <div className="col-span-7 min-w-0">
              <h3 className="font-jakarta font-semibold text-(--primary-text) md:text-sm truncate">
                {student.name}
              </h3>
            </div>

            {/* Status Column */}
            <div className="col-span-2 md:col-span-3 flex justify-end md:justify-center">
              <AttendanceCell
                status={student.status}
                onToggle={() => onToggle(student.id)}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-(--primary-bg) border-t border-(--secondary-bg) flex justify-between items-center">
        <p className="text-[10px] font-bold text-(--primary-text)/40 uppercase tracking-widest">
          Showing {data.length} Students
        </p>
      </div>
    </div>
  );
};

export default AttendanceTable;