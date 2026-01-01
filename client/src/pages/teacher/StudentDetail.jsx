// src/pages/teacher/StudentDetail.jsx

import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, UserCheck, Mail } from "lucide-react";
import { fetchStudentDetail, fetchStudentStreak } from "../../api/student.api";
import { listMyClassesApi } from "../../api/classes.api";
import { useAdmin } from "../../context/adminContext";
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
  const navigate = useNavigate();
  const admin = useAdmin();

  const [student, setStudent] = useState(null);
  const [streak, setStreak] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classroomName, setClassroomName] = useState("—");

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

        // Prefer already-loaded school classrooms (works for ADMIN/PRINCIPAL dashboards).
        const adminClasses = Array.isArray(admin?.classrooms) ? admin.classrooms : [];
        let matched = adminClasses.find((c) => c.id === detail?.classId);

        // Fallback to API lookup if adminContext isn't available.
        if (!matched) {
          try {
            const myClasses = await listMyClassesApi();
            matched = (myClasses || []).find((c) => c.id === detail?.classId);
          } catch {
            // ignore; classroomName will remain "—"
          }
        }

        setClassroomName(matched?.name || (matched ? `Std ${matched.std}-${matched.division}` : "—"));
      } catch (err) {
        console.error("Failed to load student detail", err);
        setError(err?.message || "Failed to load student detail");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id, admin?.classrooms]);

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
        <div className="bg-(--primary-bg) rounded-2xl shadow-sm border border-[rgb(var(--primary-accent-rgb)/0.05)] p-6">
          <h1 className="text-lg font-bold text-(--primary-text)">Unable to load student</h1>
          <p className="text-sm text-(--primary-accent) opacity-60 mt-2 font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="bg-(--primary-bg) rounded-2xl shadow-sm border border-[rgb(var(--primary-accent-rgb)/0.05)] p-6">
          <h1 className="text-lg font-bold text-(--primary-text)">Student not found</h1>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 p-4 md:p-8"
    >
      <div className="flex items-center">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-(--primary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] text-(--primary-accent) font-semibold hover:bg-(--secondary-bg) transition-colors"
        >
          <ArrowLeft size={16} />
          Back
        </button>
      </div>

      {/* Unified Card: Profile + Attendance */}
      <div className="bg-(--primary-bg) rounded-3xl shadow-sm border border-[rgb(var(--primary-accent-rgb)/0.05)] p-8 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-(--secondary-accent) opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

        <div className="absolute top-6 right-6 z-20">
          <span className="px-3 py-1 bg-(--secondary-bg) rounded-full text-sm text-(--primary-accent) opacity-80 font-bold border border-[rgb(var(--primary-accent-rgb)/0.08)] whitespace-nowrap">
            {classroomName}
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
          <div className="shrink-0 relative">
            <div className="w-32 h-32 rounded-2xl p-1 bg-linear-to-br from-(--secondary-accent) to-(--primary-bg) shadow-lg">
              <img
                src={student.photo}
                alt={student.name}
                className="w-full h-full rounded-xl object-cover bg-(--primary-bg)"
              />
            </div>
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div>
              <h1 className="text-3xl font-bold text-(--primary-text) tracking-tight mb-2">
                {student.name}
              </h1>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start text-sm text-(--primary-accent) opacity-70 font-medium">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-(--secondary-bg) rounded-full">
                  <UserCheck size={14} />
                  {student.gender ?? "—"}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-(--secondary-bg) rounded-full">
                  <Calendar size={14} />
                  DOB: {student.dob ?? "—"}
                </span>
                {student.email && (
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-(--secondary-bg) rounded-full">
                    <Mail size={14} /> {student.email}
                  </span>
                )}
              </div>

              <div className="mt-3 flex justify-center md:justify-start">
                <span className="px-3 py-1 bg-(--secondary-bg) rounded-full text-sm text-(--primary-accent) opacity-70 font-bold">
                  Roll No. {student.rollNo}
                </span>
              </div>
            </div>

            {/* Address and Phone removed as per request */}
          </div>
        </div>

        {/* Divider */}
        <div className="mt-8 pt-8 border-t border-[rgb(var(--primary-accent-rgb)/0.08)] relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h3 className="text-xl font-bold text-(--primary-text) flex items-center gap-2">
            <Calendar className="text-(--secondary-accent)" size={24} />
            Attendance History
          </h3>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-semibold bg-(--secondary-bg) p-2 rounded-lg w-full md:w-auto overflow-x-auto">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 bg-green-500 rounded-sm shadow-sm" />
              <span className="text-(--primary-text)">Present</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 bg-red-500 rounded-sm shadow-sm" />
              <span className="text-(--primary-text)">Absent</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 bg-[rgb(var(--primary-accent-rgb)/0.1)] rounded-sm" />
              <span className="text-(--primary-accent)/60">No Data</span>
            </div>
          </div>
        </div>

        <div className="flex gap-8 overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-(--primary-accent)/10 hover:scrollbar-thumb-(--primary-accent)/20">
          {monthsData.map((month, i) => (
            <div key={i} className="shrink-0 group">
              <div className="text-center text-xs font-bold text-(--primary-accent) opacity-50 mb-3 uppercase tracking-wider group-hover:opacity-80 transition-opacity">
                {month.label}
              </div>

              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: month.firstWeekday }).map((_, idx) => (
                  <div key={idx} className="w-7 h-7" />
                ))}

                {month.days.map((day) => {
                  let bg = "bg-[rgb(var(--primary-accent-rgb)/0.05)]"; // Default gray/empty

                  if (day.status === "P") bg = "bg-green-500 shadow-sm shadow-emerald-400/30";
                  else if (day.status === "A") bg = "bg-red-600 shadow-sm shadow-rose-400/30";

                  return (
                    <motion.div
                      key={day.date}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.005 * day.dayNumber }}
                      className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-(--primary-bg) ${bg} cursor-help transition-transform hover:scale-125 hover:z-10`}
                      title={`${day.date}: ${day.status === 'P' ? 'Present' : day.status === 'A' ? 'Absent' : 'No Class'}`}
                    >
                      {day.status ? day.dayNumber : <span className="text-(--primary-accent) opacity-30 font-normal">{day.dayNumber}</span>}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        </div>
      </div>
    </motion.div>
  );
};

export default StudentDetail;
