// src/pages/teacher/Classroom.jsx

import { motion, AnimatePresence } from "framer-motion";
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
    const t = searchTerm.trim().toLowerCase();
    if (!t) return students;
    return students.filter((s) => {
      const name = String(s?.name ?? "").trim().toLowerCase();
      const roll = String(s?.rollNo ?? "").trim().toLowerCase();
      const gender = String(s?.gender ?? "").trim().toLowerCase();
      return name.includes(t) || roll.includes(t) || gender.includes(t);
    });
  }, [students, searchTerm]);

  const presenceKey = (searchTerm.trim().toLowerCase() || "all");

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  };

  if (isLoading || classesLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader size="medium" label="Loading Class..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 md:p-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-(--primary-bg) p-6 rounded-2xl border border-[rgb(var(--primary-accent-rgb)/0.05)] shadow-sm">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-(--primary-text) tracking-tight">
            {activeClass?.name || "Classroom"}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-(--primary-accent) opacity-60 text-sm font-medium">
            <GraduationCap size={16} className="text-(--secondary-accent)" />
            <span>Academic Year: {activeClass?.educationalYear || "—"}</span>
            <span className="hidden md:inline mx-2">•</span>
            <span className="bg-(--secondary-bg) px-2.5 py-0.5 rounded-full text-(--primary-accent) border border-[rgb(var(--primary-accent-rgb)/0.05)]">
              {students.length} Students
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-(--primary-accent) opacity-40" size={18} />
          <input
            type="text"
            value={searchTerm}
            placeholder="Search by name or roll no..."
            className="w-full pl-11 pr-4 py-3 bg-(--primary-bg) border border-[rgb(var(--primary-accent-rgb)/0.1)] rounded-xl focus:outline-none focus:border-(--secondary-accent) focus:ring-1 focus:ring-(--secondary-accent) shadow-sm transition-all text-(--primary-text)"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="p-2.5 rounded-xl bg-(--secondary-bg) text-(--secondary-accent) shadow-sm">
          <Users size={20} />
        </div>
        <h2 className="text-xl font-bold text-(--primary-text)">Student Directory</h2>
      </div>

      {/* Responsive Students Grid */}
      <motion.div
        key={presenceKey}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        <AnimatePresence>
          {filteredStudents.map((student) => (
            <motion.div
              layout
              key={student.id}
              variants={itemVariants}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => navigate(`${basePath}/student/${student.id}`)}
              className="group cursor-pointer bg-(--primary-bg) border border-[rgb(var(--primary-accent-rgb)/0.05)] rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex relative"
            >
              {/* Left Stripe Decoration */}
              <div className="w-1.5 bg-(--secondary-accent)" />

              <div className="p-4 flex gap-4 w-full items-center">
                {/* Photo */}
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-inner border border-[rgb(var(--primary-accent-rgb)/0.05)]">
                    <img
                      src={student.photo}
                      alt={student.name}
                      className="w-full h-full object-cover bg-(--secondary-bg)"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                  <div className="flex items-center gap-5 min-w-0 mb-1">
                    <h3 className="text-lg font-bold text-(--primary-text) truncate group-hover:text-(--secondary-accent) transition-colors">
                      {student.name}
                    </h3>
                    <span className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-full bg-(--secondary-bg) text-(--primary-accent) border border-[rgb(var(--primary-accent-rgb)/0.1)]">
                      {student.rollNo}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-xs font-medium text-(--primary-accent) opacity-60">
                    <div className="flex justify-between items-center">
                      <span>Gender</span>
                      <span className="text-(--primary-text) opacity-100">{student.gender}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Born</span>
                      <span className="text-(--primary-text) opacity-100">{student.dob}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-(--primary-accent) opacity-40 bg-(--secondary-bg)/30 rounded-3xl border border-dashed border-[rgb(var(--primary-accent-rgb)/0.1)]">
          <div className="w-16 h-16 bg-(--secondary-bg) rounded-full flex items-center justify-center mb-4">
            <Search size={24} />
          </div>
          <p className="text-lg font-medium">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default Classroom;