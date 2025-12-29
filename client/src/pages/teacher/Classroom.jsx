// src/pages/teacher/Classroom.jsx

import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Users, Search, GraduationCap } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { fetchClassroomStudents } from "../../api/student.api";
import { listMyClassesApi } from "../../api/classes.api";
import { useAuth } from "../../context/authContext";
import Loader from "../../components/common/Loader";

const FALLBACK_CLASSROOM = {
  id: null,
  name: "Classroom",
  educationalYear: "—",
};

const Classroom = ({ basePath = "/teacher", defaultClassId = "class-10-a" }) => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeClass, setActiveClass] = useState(FALLBACK_CLASSROOM);
  const [classesLoading, setClassesLoading] = useState(true);

  const effectiveClassId = classId ?? null;

  useEffect(() => {
    let alive = true;

    const loadClass = async () => {
      try {
        setClassesLoading(true);
        const classes = await listMyClassesApi();
        if (!alive) return;

        const selected =
          (effectiveClassId && classes.find((c) => c.id === effectiveClassId)) ||
          classes[0] ||
          FALLBACK_CLASSROOM;

        setActiveClass(selected);
      } catch (error) {
        console.error("Failed to load classes", error);
        if (alive) setActiveClass(FALLBACK_CLASSROOM);
      } finally {
        if (alive) setClassesLoading(false);
      }
    };

    loadClass();
    return () => {
      alive = false;
    };
  }, [effectiveClassId, user?.id]);

  useEffect(() => {
    const loadStudents = async () => {
      try {
        if (!activeClass?.id) {
          setStudents([]);
          return;
        }

        const data = await fetchClassroomStudents(activeClass.id);
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (!classesLoading) loadStudents();
  }, [activeClass?.id, classesLoading]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return students;

    return students.filter((s) => s.name.toLowerCase().includes(term));
  }, [students, searchTerm]);

  if (isLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader size="medium" label="Loading Class..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#FBFDFF] p-6 rounded-2xl shadow-sm border border-[#2D3748]/5">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0E0E11] tracking-tight">
            {activeClass?.name || "Classroom"}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-[#2D3748]/60 text-sm">
            <GraduationCap size={16} className="text-[#85C7F2]" />
            <span className="font-medium">Academic Year: {activeClass?.educationalYear || "—"}</span>
            <span className="hidden md:inline mx-2">•</span>
            <span className="bg-[#F2F8FF] px-2 py-0.5 rounded text-[#2D3748] font-semibold border border-[#85C7F2]/20">
              {students.length} Students
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#2D3748]/40" size={18} />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#FBFDFF] border border-[#2D3748]/10 rounded-xl focus:outline-none focus:border-[#85C7F2] transition-colors"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 rounded-lg bg-[#F2F8FF] text-[#2D3748] border border-[#2D3748]/5">
          <Users size={20} />
        </div>
        <h2 className="text-xl font-bold text-[#0E0E11]">Student Directory</h2>
      </div>

      {/* Responsive Students Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ y: -6 }}
            style={{ cursor: 'pointer' }}
            className="group bg-[#FBFDFF] border border-[#2D3748]/5 overflow-hidden rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            onClick={() => navigate(`${basePath}/student/${student.id}`)}
          >
            <div className="flex flex-row items-stretch">
              {/* Photo */}
              <div className="relative w-24 sm:w-32 shrink-0 overflow-hidden">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-full h-full object-cover transition-transform duration-500"
                />
              </div>

              {/* Details (Right) */}
              <div className="flex flex-col flex-1 p-4 sm:p-5">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="min-w-0 text-base sm:text-lg font-bold text-[#0E0E11] truncate">
                    {student.name}
                  </h3>
                  <div className="ml-auto shrink-0 bg-[#F2F8FF] px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2D3748] border border-[#85C7F2]/20">
                    ROLL {student.rollNo}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#2D3748]/60">Gender</span>
                    <span className="text-[#0E0E11] font-semibold">{student.gender}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-[#2D3748]/60">Birth Date</span>
                    <span className="text-[#0E0E11] font-semibold">{student.dob}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-20 bg-[#FBFDFF] rounded-2xl border border-dashed border-[#2D3748]/20">
          <p className="text-[#2D3748]/60 font-medium">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default Classroom;