// src/components/attendance/AttendanceTable.jsx

import AttendanceCell from "./AttendanceCell";
import { motion } from "framer-motion";

const AttendanceTable = ({ data, onToggle }) => {
  return (
    <div className="w-full bg-[#FBFDFF] rounded-2xl border border-[#2D3748]/5 overflow-hidden shadow-sm">
      {/* Desktop Table Header (Hidden on Mobile) */}
      <div className="hidden md:grid grid-cols-12 bg-[#FBFDFF] border-b border-[#2D3748]/5 px-6 py-4">
        <div className="col-span-2 text-xs font-bold uppercase tracking-widest text-[#2D3748]/40">
          Roll No
        </div>
        <div className="col-span-7 text-xs font-bold uppercase tracking-widest text-[#2D3748]/40">
          Student Name
        </div>
        <div className="col-span-3 text-center text-xs font-bold uppercase tracking-widest text-[#2D3748]/40">
          Status
        </div>
      </div>

      {/* Mobile Table Header */}
      <div className="grid md:hidden grid-cols-12 bg-[#FBFDFF] border-b border-[#2D3748]/5 px-4 py-3">
        <div className="col-span-3 text-[10px] font-bold uppercase tracking-widest text-[#2D3748]/40">
          Roll No
        </div>
        <div className="col-span-7 text-[10px] font-bold uppercase tracking-widest text-[#2D3748]/40">
          Student Name
        </div>
        <div className="col-span-2 text-right text-[10px] font-bold uppercase tracking-widest text-[#2D3748]/40">
          Status
        </div>
      </div>

      <div className="divide-y divide-[#2D3748]/5">
        {data.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.03 }}
            className="grid grid-cols-12 items-center px-4 py-3 md:px-6 md:py-3 hover:bg-[#F2F8FF] transition-colors"
          >
            {/* Roll No */}
            <div className="col-span-3 md:col-span-2 flex items-center gap-2">
              <span className="text-sm font-bold text-[#2D3748]">
                {student.rollNo.toString().padStart(2, "0")}
              </span>
            </div>

            {/* Name Column */}
            <div className="col-span-7 min-w-0">
              <h3 className="font-semibold text-[#0E0E11] md:text-sm truncate">
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
      <div className="px-6 py-4 bg-[#FBFDFF] border-t border-[#2D3748]/5 flex justify-between items-center">
        <p className="text-[10px] font-bold text-[#2D3748]/40 uppercase tracking-widest">
          Showing {data.length} Students
        </p>
      </div>
    </div>
  );
};

export default AttendanceTable;