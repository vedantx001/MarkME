// src/pages/teacher/Classroom.jsx

import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import { Users, Search, GraduationCap } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { fetchClassroomStudents } from "../../api/student.api";
import Loader from "../../components/common/Loader";

const classroomMock = {
  name: "Class 10 - Division A",
  academicYear: "2024 – 2025",
  totalStudents: 42
};

const CLASSROOM_META_BY_ID = {
  "ce-a": { name: "CE-A", academicYear: "2024 – 2025" },
  "ce-b": { name: "CE-B", academicYear: "2024 – 2025" },
  "class-10-a": classroomMock,
};

const Classroom = ({ basePath = "/teacher", defaultClassId = "class-10-a" }) => {
  const navigate = useNavigate();
  const { classId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveClassId = classId ?? defaultClassId;
  const classroomMeta = CLASSROOM_META_BY_ID[effectiveClassId] ?? {
    name: effectiveClassId ?? "Classroom",
    academicYear: classroomMock.academicYear,
  };

  useEffect(() => {
    const loadStudents = async () => {
      try {
        const data = await fetchClassroomStudents(effectiveClassId);
        setStudents(data);
      } catch (error) {
        console.error("Failed to load students", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStudents();
  }, [effectiveClassId]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return students;

    return students.filter((s) => s.name.toLowerCase().includes(term));
  }, [students, searchTerm]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader size="medium" label="Loading Class..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 font-inter">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-(--primary-bg) p-6 rounded-2xl border border-(--secondary-bg) shadow-sm">
        <div>
          <h1 className="font-jakarta text-2xl md:text-3xl font-bold text-(--primary-text)">
            {classroomMeta.name}
          </h1>
          <div className="flex items-center gap-2 mt-2 text-(--primary-text)/60 text-sm">
            <GraduationCap size={16} className="text-(--secondary-accent)" />
            <span>Academic Year: {classroomMeta.academicYear}</span>
            <span className="hidden md:inline mx-2">•</span>
            <span className="bg-(--secondary-bg) px-2 py-0.5 rounded text-(--primary-accent) font-medium">
              {students.length} Students
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-(--primary-text)/40" size={18} />
          <input
            type="text"
            placeholder="Search students..."
            className="w-full pl-10 pr-4 py-2.5 bg-(--primary-bg) border border-(--secondary-bg) rounded-xl focus:outline-none focus:border-(--secondary-accent) transition-colors"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grid Header */}
      <div className="flex items-center gap-3 px-2">
        <div className="p-2 rounded-lg bg-(--secondary-accent)/10 text-(--secondary-accent)">
          <Users size={20} />
        </div>
        <h2 className="font-jakarta text-xl font-bold text-(--primary-accent)">Student Directory</h2>
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
            className="group bg-(--primary-bg) border border-(--secondary-bg) overflow-hidden hover:shadow-xl transition-all duration-300 min-h-40 rounded-md"
            onClick={() => navigate(`${basePath}/student/${student.id}`)}
          >
            <div className="flex flex-row items-stretch">
              {/* Photo */}
              <div className="relative w-24 sm:w-32 shrink-0 overflow-hidden">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="w-full h-full object-cover transition-transform duration-500 py-5 pl-3"
                />
              </div>

              {/* Details (Right) */}
              <div className="flex flex-col flex-1 p-4 sm:p-5">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="min-w-0 font-jakarta text-base sm:text-lg font-bold text-(--primary-text) truncate">
                    {student.name}
                  </h3>
                  <div className="ml-auto shrink-0 bg-(--secondary-bg) px-2 py-0.5 rounded-full text-[10px] font-bold text-(--primary-accent)">
                    ROLL {student.rollNo}
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-(--primary-text)/50">Gender</span>
                    <span className="text-(--primary-accent) font-medium">{student.gender}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-(--primary-text)/50">Birth Date</span>
                    <span className="text-(--primary-accent) font-medium">{student.dob}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredStudents.length === 0 && (
        <div className="text-center py-20 bg-(--primary-bg) rounded-2xl border border-dashed border-(--secondary-accent)/30">
          <p className="text-(--primary-text)/40 font-medium">No students found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default Classroom;