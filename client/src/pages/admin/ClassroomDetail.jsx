import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users,
  Search,
  Plus,
  Upload,
  Pencil,
  Trash2,
  FileSpreadsheet,
  FileArchive,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Loader from "../../components/common/Loader";
import { fetchClassroomStudents, deleteStudent } from "../../api/student.api";
import AddStudentForm from "../../components/forms/AddStudentForm";
import BulkStudentUploadForm from "../../components/forms/BulkStudentUploadForm";
import EditStudentForm from "../../components/forms/EditStudentForm";

const ClassroomDetail = () => {
  const navigate = useNavigate();
  const { classId } = useParams();

  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [openAdd, setOpenAdd] = useState(false);
  const [openBulk, setOpenBulk] = useState(false);
  const [bulkMode, setBulkMode] = useState("excel");

  // Tracks whether Excel bulk upload has completed (in this UI session) for this class.
  // Server requires students to exist before photos can be mapped by rollNumber.
  const [excelUploaded, setExcelUploaded] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [rowBusyId, setRowBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    const data = await fetchClassroomStudents(classId);
    setStudents(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
    // Reset gating when switching classrooms
    setExcelUploaded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId]);

  const filteredStudents = useMemo(() => {
    const t = searchTerm.trim().toLowerCase();
    if (!t) return students;
    return students.filter((s) =>
      `${s.name} ${s.rollNo} ${s.gender}`.toLowerCase().includes(t)
    );
  }, [students, searchTerm]);

  const onDelete = async (student) => {
    const ok = window.confirm(
      `Delete student "${student.name}" (Roll ${student.rollNo})?`
    );
    if (!ok) return;

    try {
      setRowBusyId(student.id);
      await deleteStudent(student.id);
      await load();
    } finally {
      setRowBusyId(null);
    }
  };

  const openEdit = (student) => {
    setSelectedStudent(student);
    setIsEditOpen(true);
  };

  const openBulkExcel = () => {
    setBulkMode("excel");
    setOpenBulk(true);
  };

  const openBulkZip = () => {
    // Server expects students to already exist in the class so photos can be mapped by rollNumber.
    // Keep a friendly guard, but don't disable the UI button.
    if (!excelUploaded) {
      window.alert(
        "Tip: Upload Bulk Excel first (student details). Then upload Bulk ZIP for photos."
      );
      return;
    }
    setBulkMode("zip");
    setOpenBulk(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader label="Loading classroom..." />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      {/* Modals */}
      <AddStudentForm
        isOpen={openAdd}
        onClose={() => setOpenAdd(false)}
        classroomId={classId}
        onCreated={load}
      />

      <BulkStudentUploadForm
        isOpen={openBulk}
        onClose={() => setOpenBulk(false)}
        classroomId={classId}
        mode={bulkMode}
        onUploaded={() => {
          // If Excel upload succeeded, allow ZIP uploads in this session.
          if (bulkMode === "excel") setExcelUploaded(true);
          return load();
        }}
      />

      <EditStudentForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        classroomId={classId}
        student={selectedStudent}
        onUpdated={load}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-white p-6 rounded-2xl border">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#F2F8FF] flex items-center justify-center">
            <Users className="text-[#85C7F2]" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Classroom Students</h1>
            <p className="text-sm text-gray-500">
              {students.length} Students
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 items-center">
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2D3748] text-white font-semibold"
          >
            <Plus size={18} /> Add Student
          </button>

          <button
            type="button"
            onClick={openBulkExcel}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-semibold"
            title="Upload student details (Excel)"
          >
            <FileSpreadsheet size={18} /> Bulk Excel
          </button>

          <button
            type="button"
            onClick={openBulkZip}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-gray-50 font-semibold"
            title="Upload student photos (ZIP)"
          >
            <FileArchive size={18} /> Bulk ZIP
          </button>

          <div className="text-xs text-gray-500 w-full md:w-auto">
            Tip: Upload{" "}
            <span className="font-semibold">Bulk Excel</span> first, then{" "}
            <span className="font-semibold">Bulk ZIP</span> for photos.
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="w-full pl-10 pr-4 py-2 border rounded-xl"
          placeholder="Search students..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Students Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="bg-white border rounded-xl hover:shadow-lg"
          >
            <div className="flex p-4 gap-4">
              <img
                src={s.photo}
                alt={s.name}
                className="w-20 h-20 rounded-lg object-cover"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{s.name}</h3>
                <p className="text-sm text-gray-500">Roll {s.rollNo}</p>
                <p className="text-sm">{s.gender}</p>

                <div className="mt-3 flex justify-between items-center">
                  <button
                    onClick={() => navigate(`/admin/student/${s.id}`)}
                    className="text-sm font-semibold text-[#2D3748]"
                  >
                    View Student
                  </button>

                  <div className="flex gap-2">
                    <button
                      disabled={rowBusyId === s.id}
                      onClick={() => openEdit(s)}
                      className="p-2 border rounded-lg"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      disabled={rowBusyId === s.id}
                      onClick={() => onDelete(s)}
                      className="p-2 border rounded-lg text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          No students found
        </div>
      )}
    </div>
  );
};

export default ClassroomDetail;