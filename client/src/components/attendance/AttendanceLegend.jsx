// src/components/attendance/AttendanceLegend.jsx

import React from 'react';
import { Info } from 'lucide-react';

const AttendanceLegend = () => {
  const legendItems = [
    { label: "Present", color: "#7bf1a8", desc: "Detected by AI" },
    { label: "Absent", color: "#ffa2a2", desc: "Not found" },
  ];

  return (
    <div className="bg-white/50 backdrop-blur-sm border border-(--secondary-bg) rounded-2xl p-4 md:p-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3 md:mb-4 text-(--primary-text)/40">
        <Info size={14} />
        <span className="text-[10px] font-bold uppercase tracking-widest">Status Legend</span>
      </div>

      <div className="flex flex-row sm:flex-row sm:items-center gap-4 md:gap-8">
        {legendItems.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div 
              className={`w-4 h-4 rounded-md transition-shadow ${item.isUncertain ? 'border border-dashed border-(--secondary-accent)/50' : 'shadow-sm shadow-[#85C7F2]/20'}`}
              style={{ backgroundColor: item.isUncertain ? 'transparent' : item.color }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-(--primary-text) leading-none">
                {item.label}
              </span>
              <span className="text-[10px] text-(--primary-text)/50 mt-1 uppercase font-medium">
                {item.desc}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AttendanceLegend;