// src/pages/teacher/StudentDetail.jsx

import { useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, UserCheck } from "lucide-react";
import { fetchStudentDetail, fetchStudentStreak } from "../../api/student.api";
import Loader from "../../components/common/Loader";

/* ---------------- Academic Year Day Generator ---------------- */

const generateAcademicYearDays = (attendanceMap) => {
  const result = [];
  const today = new Date();
  const currentYear = today.getFullYear();

  let startYear = today.getMonth() < 5 ? currentYear - 1 : currentYear;

  const startDate = new Date(startYear, 5, 1); // June 1
  const endDate = new Date(startYear + 1, 3, 30); // April 30

  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const y = currentDate.getFullYear();
    const m = String(currentDate.getMonth() + 1).padStart(2, "0");
    const d = String(currentDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    result.push({
      date: dateStr,
      status: attendanceMap[dateStr] || null,
      dayNumber: currentDate.getDate(),
      weekday: currentDate.getDay(),
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return result;
};

/* ---------------- Group Days By Month (LeetCode Style) ---------------- */

const groupDaysByMonth = (days) => {
  const months = {};

  days.forEach((day) => {
    const [y, m] = day.date.split("-").map(Number);
    const key = `${y}-${m}`;

    if (!months[key]) {
      const firstDate = new Date(y, m - 1, 1);
      months[key] = {
        label: firstDate.toLocaleString("default", { month: "short" }),
        firstWeekday: firstDate.getDay(),
        days: [],
      };
    }

    months[key].days.push(day);
  });

  return Object.values(months);
};

/* ---------------- Main Component ---------------- */

const StudentDetail = () => {
  const { id } = useParams();

  const [student, setStudent] = useState(null);
  const [streak, setStreak] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [detail, history] = await Promise.all([
          fetchStudentDetail(id),
          fetchStudentStreak(id),
        ]);
        setStudent(detail);
        setStreak(history);
      } catch (err) {
        console.error("Failed to load student", err);
        setStudent(null);
        setStreak([]);
        setError(err?.message || "Failed to load student details");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  const attendanceMap = useMemo(() => {
    return (streak || []).reduce((acc, cur) => {
      acc[cur.date] = cur.status;
      return acc;
    }, {});
  }, [streak]);

  const days = useMemo(
    () => generateAcademicYearDays(attendanceMap),
    [attendanceMap]
  );

  const monthsData = useMemo(
    () => groupDaysByMonth(days),
    [days]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader size="medium" label="Loading Student..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#FBFDFF] rounded-2xl shadow-sm border border-[#2D3748]/5 p-6">
          <h1 className="text-lg font-bold text-[#0E0E11]">Unable to load student</h1>
          <p className="text-sm text-[#2D3748]/60 mt-2 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#FBFDFF] rounded-2xl shadow-sm border border-[#2D3748]/5 p-6">
          <h1 className="text-lg font-bold text-[#0E0E11]">Student not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Profile Card */}
      <div className="bg-[#FBFDFF] rounded-2xl shadow-sm border border-[#2D3748]/5 p-6 md:p-8 flex gap-6">
        <img
          src={student.photo}
          alt={student.name}
          className="w-28 h-28 rounded-2xl object-cover border border-[#2D3748]/10"
        />

        <div className="flex-1 space-y-3">
          <h1 className="text-2xl font-bold text-[#0E0E11] tracking-tight">
            {student.name}
          </h1>
          <p className="text-sm font-semibold text-[#2D3748]">
            Roll No: {student.rollNo}
          </p>

          <div className="flex gap-4 text-sm text-[#2D3748]/60 font-medium">
            <span className="flex items-center gap-1">
              <UserCheck size={14} />
              {student.gender ?? "—"}
            </span>
            <span className="flex items-center gap-1">
              <Calendar size={14} />
              {student.dob ?? "—"}
            </span>
          </div>
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-[#FBFDFF] rounded-2xl shadow-sm border border-[#2D3748]/5 p-6">
        <h3 className="text-lg font-bold text-[#0E0E11] mb-6">
          Attendance History
        </h3>

        <div className="flex gap-6 overflow-x-auto pb-4">
          {monthsData.map((month, i) => (
            <div key={i} className="shrink-0">
              <div className="text-center text-[11px] font-semibold text-(--primary-text)/50 mb-2">
                {month.label}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: month.firstWeekday }).map((_, idx) => (
                  <div key={idx} className="w-6 h-6" />
                ))}

                {month.days.map((day) => {
                  let bg = "bg-gray-300";

                  if (day.status === "P") bg = "bg-green-400";
                  else if (day.status === "A") bg = "bg-red-400";

                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`w-6 h-6 rounded-sm flex items-center justify-center text-[9px] font-bold text-[#0E0E11] ${bg}`}
                      title={day.date}
                    >
                      {day.dayNumber}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-end gap-4 mt-4 text-[10px] text-[#2D3748]/50 font-semibold">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-green-400 rounded-sm" /> Present
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-red-400 rounded-sm" /> Absent
          </div>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 bg-gray-300 rounded-sm" /> No Class
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
