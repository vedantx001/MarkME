import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import { IoClose } from "react-icons/io5";
import { FaTrash, FaCamera, FaImage, FaUsers, FaClipboardList, FaEdit } from "react-icons/fa";
import { useClassrooms } from "../context/ClassroomContext";
import api from "../utils/api";

// Helper functions for slug and display name
const createClassSlug = (name) => name.replace(/Class|Section|-/gi, "").replace(/\s+/g, "");
const toDisplayNameFromSlug = (slug) => {
    const s = String(slug).toUpperCase().replace(/\s+/g, "");
    const m = s.match(/^(\d+)([A-Z]+)$/);
    if (m) return `Class ${m[1]} - Section ${m[2]}`;
    return slug;
};

export default function ClassroomPage() {
    // --- State and Hooks ---
    const { classId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { classrooms, deleteClassroom, fetchClassrooms } = useClassrooms();

    const currentClassroom = classrooms.find(c => createClassSlug(c.name).toUpperCase() === String(classId).toUpperCase());
    const displayName = currentClassroom ? currentClassroom.name : toDisplayNameFromSlug(classId);
    
    // State to manage the active view ("students" or "attendance")
    const [activeView, setActiveView] = useState("students");
    
    // Students state from backend
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentsError, setStudentsError] = useState("");
    
    // Mock data for attendance records
    const [attendanceRecords, setAttendanceRecords] = useState([
        { id: 101, name: 'Aarav Patel', rollNo: '01', status: 'P' },
        { id: 102, name: 'Priya Sharma', rollNo: '02', status: 'A' },
        { id: 103, name: 'Rohan Mehta', rollNo: '03', status: 'P' },
    ]);

    // Track if attendance has been taken (to show Download button)
    const [attendanceTaken, setAttendanceTaken] = useState(false);

    // Modal and form state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditClassModalOpen, setIsEditClassModalOpen] = useState(false);
    const [editStandard, setEditStandard] = useState("");
    const [editDivision, setEditDivision] = useState("A");
    const [editClassError, setEditClassError] = useState("");

    const [isEditStudentModalOpen, setIsEditStudentModalOpen] = useState(false);
    const [editingStudentId, setEditingStudentId] = useState(null);
    const [editStudentName, setEditStudentName] = useState("");
    const [editStudentRollNo, setEditStudentRollNo] = useState("");
    const [editStudentGender, setEditStudentGender] = useState("Male");
    const [editStudentPhoto, setEditStudentPhoto] = useState(null);
    const [editPhotoPreview, setEditPhotoPreview] = useState("");
    const [editPhotoDataUrl, setEditPhotoDataUrl] = useState("");
    const [editStudentError, setEditStudentError] = useState("");
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const attendanceFileInputRef = useRef(null);
    const [newStudentName, setNewStudentName] = useState("");
    const [newStudentRollNo, setNewStudentRollNo] = useState("");
    const [newStudentGender, setNewStudentGender] = useState("Male");
    const [newStudentPhoto, setNewStudentPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [photoDataUrl, setPhotoDataUrl] = useState("");
    const [error, setError] = useState("");

    // --- Handlers ---
    const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

    const loadImage = (src) => new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });

    const estimateBytes = (dataUrl) => {
        const base64 = String(dataUrl).split(',')[1] || '';
        return Math.ceil((base64.length * 3) / 4);
    };

    const compressToDataURL = (img, maxDim, quality) => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        const scale = Math.min(maxDim / width, maxDim / height, 1);
        width = Math.floor(width * scale);
        height = Math.floor(height * scale);
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        return canvas.toDataURL('image/jpeg', quality);
    };

    const compressImageFile = async (file) => {
        const original = await readFileAsDataURL(file);
        const img = await loadImage(original);
        const targets = [
            { dim: 800, q: 0.7 },
            { dim: 640, q: 0.6 },
            { dim: 512, q: 0.5 },
            { dim: 384, q: 0.45 },
            { dim: 320, q: 0.4 },
        ];
        const maxBytes = 90 * 1024; // aim under 90KB to avoid typical 100KB limit
        let best = original;
        for (const t of targets) {
            const out = compressToDataURL(img, t.dim, t.q);
            best = out;
            if (estimateBytes(out) <= maxBytes) return out;
        }
        return best; // return smallest attempted even if still larger
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewStudentPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
            try {
                const dataUrl = await compressImageFile(file);
                setPhotoDataUrl(String(dataUrl));
            } catch {
                setPhotoDataUrl("");
            }
        }
    };

    const handleEditPhotoChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            setEditStudentPhoto(file);
            setEditPhotoPreview(URL.createObjectURL(file));
            try {
                const dataUrl = await compressImageFile(file);
                setEditPhotoDataUrl(String(dataUrl));
            } catch {
                setEditPhotoDataUrl("");
            }
        }
    };
    
    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!currentClassroom?.id) {
            setError("Classroom not ready. Please try again.");
            return;
        }
        if (!newStudentName.trim() || !newStudentRollNo.trim() || !newStudentPhoto) {
            setError("All fields, including a photo, are required.");
            return;
        }
        try {
            await api.post('/students', {
                name: newStudentName.trim(),
                rollNo: Number(newStudentRollNo),
                gender: newStudentGender,
                photo: photoDataUrl || null,
                classroomId: currentClassroom.id,
            });
            await fetchStudents();
            closeModal();
        } catch (err) {
            setError(err?.response?.data?.error || err?.message || 'Failed to add student');
        }
    };
    
    const handleDeleteStudent = async (studentId) => {
        if (!studentId) return;
        if (!window.confirm("Are you sure you want to delete this student?")) return;
        try {
            await api.delete(`/students/${studentId}`);
            await fetchStudents();
        } catch (err) {
            alert(err?.response?.data?.error || err?.message || 'Failed to delete student');
        }
    };

    const handleDeleteClassroom = () => {
        if (window.confirm("WARNING: This will delete the entire classroom and all its students. Are you sure?")) {
            if (currentClassroom) {
                deleteClassroom(currentClassroom.id);
                navigate("/teacher");
            }
        }
    };

    const openEditClassModal = () => {
        if (!currentClassroom) return;
        setEditStandard(String(currentClassroom.standard || ""));
        setEditDivision(String(currentClassroom.division || "A"));
        setEditClassError("");
        setIsEditClassModalOpen(true);
    };

    const toDisplayName = (std, div) => `Class ${std} - Section ${div}`;

    const handleUpdateClassroom = async (e) => {
        e.preventDefault();
        if (!currentClassroom?.id) return;
        try {
            setEditClassError("");
            await api.put(`/classrooms/${currentClassroom.id}`, {
                standard: Number(editStandard),
                division: String(editDivision).toUpperCase(),
            });
            await fetchClassrooms();
            const newName = toDisplayName(Number(editStandard), String(editDivision).toUpperCase());
            const newSlug = createClassSlug(newName).toUpperCase();
            const base = (location.pathname.split('/')[1] || 'teacher');
            setIsEditClassModalOpen(false);
            navigate(`/${base}/${newSlug}`);
        } catch (err) {
            setEditClassError(err?.response?.data?.error || err?.message || 'Failed to update classroom');
        }
    };

    const handleAttendancePhotoUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        console.log("Attendance photo selected:", file.name);
        setAttendanceTaken(true);
        setIsAttendanceModalOpen(false);
    };

    const handleUploadFromGalleryClick = () => {
        attendanceFileInputRef.current.click();
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewStudentName(""); setNewStudentRollNo(""); setNewStudentGender("Male"); setNewStudentPhoto(null); setPhotoPreview(""); setError("");
    };

    const openEditStudentModal = (student) => {
        setEditingStudentId(student.id);
        setEditStudentName(student.name || "");
        setEditStudentRollNo(String(student.rollNo || ""));
        setEditStudentGender(student.gender || "Male");
        setEditStudentPhoto(null);
        setEditPhotoPreview(student.photoUrl || "");
        setEditPhotoDataUrl("");
        setEditStudentError("");
        setIsEditStudentModalOpen(true);
    };

    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!editingStudentId) return;
        try {
            setEditStudentError("");
            const payload = {
                name: editStudentName.trim(),
                rollNo: Number(editStudentRollNo),
                gender: editStudentGender,
            };
            if (editPhotoDataUrl) payload.photo = editPhotoDataUrl;
            await api.put(`/students/${editingStudentId}`, payload);
            await fetchStudents();
            setIsEditStudentModalOpen(false);
        } catch (err) {
            setEditStudentError(err?.response?.data?.error || err?.message || 'Failed to update student');
        }
    };

    // Date helpers
    const formatDate = (date) => {
        const d = new Date(date);
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        return `${dd}-${mm}-${yyyy}`;
    };
    const weekdayName = (date) => new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(date));

    // Download CSV of attendance
    const handleDownloadAttendance = () => {
        const today = new Date();
        const headers = ['Roll No', 'Name', 'Status', 'Date'];
        const rows = attendanceRecords.map(r => [
            r.rollNo,
            r.name,
            r.status === 'P' ? 'Present' : 'Absent',
            formatDate(today)
        ]);
        const csv = [headers, ...rows]
            .map(row => row.map(field => String(field).replace(/"/g, '""')).map(f => `"${f}"`).join(','))
            .join('\r\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const fileSlug = String(classId).toUpperCase();
        link.href = url;
        link.download = `Attendance_${fileSlug}_${formatDate(today)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Load students for current classroom
    const fetchStudents = async () => {
        if (!currentClassroom?.id) return;
        try {
            setStudentsLoading(true);
            setStudentsError("");
            let list = [];
            try {
                const res = await api.get('/students', { params: { classroomId: currentClassroom.id } });
                list = Array.isArray(res.data) ? res.data : [];
            } catch (err) {
                // Fallback: fetch all and filter client-side if backend filtering fails
                const resAll = await api.get('/students');
                const all = Array.isArray(resAll.data) ? resAll.data : [];
                list = all.filter(s => {
                    const cid = s.classroomId && typeof s.classroomId === 'object' ? s.classroomId._id : s.classroomId;
                    return String(cid) === String(currentClassroom.id);
                });
            }
            const shaped = list.map(s => ({
                id: s._id,
                name: s.name,
                rollNo: s.rollNo,
                gender: s.gender,
                photoUrl: s.photoId?.url || '',
            }));
            setStudents(shaped);
        } catch (err) {
            setStudentsError(err?.response?.data?.error || err?.message || 'Failed to load students');
        } finally {
            setStudentsLoading(false);
        }
    };

    useEffect(() => {
        fetchStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentClassroom?.id]);

    // Always render with a friendly title, even if context data isn't loaded yet

    return (
        <div className="min-h-screen bg-[var(--primary-background)]">
            <Navbar />
            <main className="p-8">
                <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--primary-text)]">
                            Classroom: <span className="text-[var(--accent-color)]">{displayName}</span>
                        </h1>
                        <p className="mt-1 text-[var(--secondary-text)]">Manage students and take attendance for this class.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button onClick={openEditClassModal} className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--secondary-background)] px-4 py-2 font-semibold text-[var(--primary-text)] shadow-md transition-transform duration-200 hover:scale-105 border border-[var(--secondary-text)]">
                            <FaEdit /> Edit Classroom
                        </button>
                        <button onClick={() => setIsModalOpen(true)} className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--accent-color)] px-4 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:opacity-90 hover:scale-105">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 11a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1v-1a1 1 0 10-2 0v1h-1z" /></svg>
                             Add Student
                        </button>
                        <button onClick={handleDeleteClassroom} className="flex cursor-pointer items-center gap-2 rounded-lg bg-red-600 px-4 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:bg-red-700 hover:scale-105">
                            <FaTrash /> Delete Classroom
                        </button>
                    </div>
                </header>

                <div className="rounded-lg bg-[var(--secondary-background)] p-6 shadow-lg">
                    <div className="mb-6 flex justify-center">
                        <div className="inline-flex p-1 bg-[var(--secondary-background)]">
                            <button onClick={() => setActiveView('students')} className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${activeView === 'students' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--secondary-text)] hover:bg-[var(--primary-background)]'}`}>
                                <FaUsers /> Students
                            </button>
                            <button onClick={() => setActiveView('attendance')} className={`flex items-center gap-2 px-6 py-2 text-sm font-semibold transition-colors duration-300 ${activeView === 'attendance' ? 'bg-[var(--accent-color)] text-white' : 'text-[var(--secondary-text)] hover:bg-[var(--primary-background)]'}`}>
                                <FaClipboardList /> Attendance Details
                            </button>
                        </div>
                    </div>
                        <div className="mb-6 h-px w-full bg-black/60 opacity-15" />

                    {activeView === 'students' && (
                        <div>
                            <h2 className="mb-4 text-xl font-semibold text-[var(--primary-text)]">Student List</h2>
                            {studentsLoading ? (
                                <p className="mt-4 text-center text-[var(--secondary-text)]">Loading students...</p>
                            ) : studentsError ? (
                                <p className="mt-4 text-center text-red-500">{studentsError}</p>
                            ) : students.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-b-[var(--primary-background)] text-[var(--secondary-text)]">
                                            <th className="p-3">Photo</th>
                                            <th className="p-3">Roll No.</th>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Gender</th>
                                            <th className="p-3 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((student) => (
                                            <tr key={student.id} className="border-b border-b-[var(--primary-background)] text-[var(--primary-text)]">
                                                <td className="p-3"><img src={student.photoUrl || 'https://via.placeholder.com/48'} alt={student.name} className="h-12 w-12 rounded-full object-cover" /></td>
                                                <td className="p-3 font-medium">{student.rollNo}</td>
                                                <td className="p-3">{student.name}</td>
                                                <td className="p-3 text-[var(--secondary-text)]">{student.gender}</td>
                                                <td className="p-3 text-right space-x-2">
                                                    <button onClick={() => openEditStudentModal(student)} className="cursor-pointer rounded-md p-2 text-[var(--secondary-text)] transition-colors hover:bg-[var(--primary-background)]" title="Edit Student"><FaEdit /></button>
                                                    <button onClick={() => handleDeleteStudent(student.id)} className="cursor-pointer rounded-md p-2 text-[var(--secondary-text)] transition-colors hover:bg-red-100 hover:text-red-500" title="Delete Student"><FaTrash /></button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="mt-4 text-center text-[var(--secondary-text)]">No students have been added to this class yet.</p>
                            )}
                        </div>
                    )}

                    {activeView === 'attendance' && (
                        <div>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-xl font-semibold text-[var(--primary-text)]">Attendance Details</h2>
                                <div className="text-right text-sm">
                                    <p className="text-[var(--primary-text)]">{formatDate(new Date())}</p>
                                    <p className="text-[var(--secondary-text)]">{weekdayName(new Date())}</p>
                                </div>
                            </div>
                            <div className="mb-4">
                                <button onClick={() => setIsAttendanceModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-[var(--accent-color)] px-4 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:opacity-90">
                                    <FaCamera /> Take Attendance
                                </button>
                                {attendanceTaken && attendanceRecords.length > 0 && (
                                    <button onClick={handleDownloadAttendance} className="ml-3 inline-flex items-center gap-2 rounded-lg border border-[var(--accent-color)] bg-[var(--secondary-background)] px-4 py-2 font-semibold text-[var(--primary-text)] shadow-sm transition-colors duration-200 hover:bg-[var(--primary-background)]">
                                        Download
                                    </button>
                                )}
                            </div>
                            {attendanceRecords.length > 0 ? (
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b-2 border-b-[var(--primary-background)] text-[var(--secondary-text)]">
                                            <th className="p-3">Roll No.</th>
                                            <th className="p-3">Name</th>
                                            <th className="p-3 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceRecords.map((record) => (
                                            <tr key={record.id} className="border-b border-b-[var(--primary-background)] text-[var(--primary-text)]">
                                                <td className="p-3 font-medium">{record.rollNo}</td>
                                                <td className="p-3">{record.name}</td>
                                                <td className="p-3 text-center">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${record.status === 'P' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                        {record.status === 'P' ? 'Present' : 'Absent'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p className="mt-4 text-center text-[var(--secondary-text)]">No attendance records found.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Add Student Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-lg bg-[var(--secondary-background)] p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--primary-text)]">Add a New Student</h2>
                            <button onClick={closeModal} className="cursor-pointer rounded-full p-1 text-[var(--secondary-text)] transition-colors hover:bg-red-600 hover:text-white"><IoClose className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleAddStudent}>
                            {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="flex flex-col items-center">
                                    <label className="mb-2 block text-sm font-medium text-[var(--secondary-text)]">Student Photo</label>
                                    <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-[var(--primary-text)] bg-[var(--primary-background)]">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview" className="h-full w-full rounded-lg object-cover" />
                                        ) : (
                                            <span className="text-sm text-[var(--secondary-text)]">Photo Preview</span>
                                        )}
                                    </div>
                                    <input type="file" id="photoUpload" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                    <label htmlFor="photoUpload" className="mt-4 cursor-pointer rounded-md border border-[var(--secondary-text)] px-4 py-2 text-sm font-semibold text-[var(--primary-text)] transition hover:opacity-90">Choose Photo</label>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="studentName" className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Full Name</label>
                                        <input type="text" id="studentName" value={newStudentName} onChange={(e) => setNewStudentName(e.target.value)} placeholder="Enter full name" className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                    </div>
                                    <div>
                                        <label htmlFor="rollNo" className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Roll Number</label>
                                        <input type="text" id="rollNo" value={newStudentRollNo} onChange={(e) => setNewStudentRollNo(e.target.value)} placeholder="Enter roll number" className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                    </div>
                                    <div>
                                        <label htmlFor="gender" className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Gender</label>
                                        <select id="gender" value={newStudentGender} onChange={(e) => setNewStudentGender(e.target.value)} className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]">
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <button type="button" onClick={closeModal} className="cursor-pointer rounded-lg bg-[var(--secondary-background)] px-4 py-2 font-semibold text-[var(--primary-text)] transition hover:opacity-90 border border-[var(--secondary-text)]">Cancel</button>
                                <button type="submit" className="cursor-pointer rounded-lg bg-[var(--accent-color)] px-4 py-2 font-semibold text-white transition hover:opacity-90">Add Student</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Attendance Choice Modal */}
            {isAttendanceModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm rounded-lg bg-[var(--secondary-background)] p-6 shadow-2xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--primary-text)]">Take Attendance</h2>
                            <button onClick={() => setIsAttendanceModalOpen(false)} className="cursor-pointer rounded-full p-1 text-[var(--secondary-text)] transition-colors hover:bg-red-600 hover:text-white"><IoClose className="h-6 w-6" /></button>
                        </div>
                        <div className="space-y-4">
                            <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-[var(--secondary-background)] px-4 py-3 font-semibold text-[var(--primary-text)] transition hover:opacity-90" onClick={() => alert("Camera functionality will be added next!")}>
                                <FaCamera className="text-xl" /> Use Camera
                            </button>
                            <button className="flex w-full items-center justify-center gap-3 rounded-lg bg-[var(--secondary-background)] px-4 py-3 font-semibold text-[var(--primary-text)] transition hover:opacity-90" onClick={handleUploadFromGalleryClick}>
                                <FaImage className="text-xl" /> Upload from Gallery
                            </button>
                            <input type="file" ref={attendanceFileInputRef} className="hidden" accept="image/*" onChange={handleAttendancePhotoUpload} />
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Classroom Modal */}
            {isEditClassModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm">
                    <div className="relative w-full max-w-md rounded-lg bg-[var(--secondary-background)] p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--primary-text)]">Edit Classroom</h2>
                            <button onClick={() => setIsEditClassModalOpen(false)} className="cursor-pointer rounded-full p-1 text-[var(--secondary-text)] transition-colors hover:bg-red-600 hover:text-white"><IoClose className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleUpdateClassroom}>
                            {editClassError && <p className="mb-4 text-center text-sm text-red-500">{editClassError}</p>}
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Standard</label>
                                    <input type="number" min={1} max={12} value={editStandard} onChange={(e) => setEditStandard(e.target.value)} className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Division</label>
                                    <select value={editDivision} onChange={(e) => setEditDivision(e.target.value)} className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]">
                                        <option>A</option>
                                        <option>B</option>
                                        <option>C</option>
                                        <option>D</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsEditClassModalOpen(false)} className="cursor-pointer rounded-lg bg-[var(--secondary-background)] px-4 py-2 font-semibold text-[var(--primary-text)] transition hover:opacity-90 border border-[var(--secondary-text)]">Cancel</button>
                                <button type="submit" className="cursor-pointer rounded-lg bg-[var(--accent-color)] px-4 py-2 font-semibold text-white transition hover:opacity-90">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Student Modal */}
            {isEditStudentModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-sm">
                    <div className="relative w-full max-w-lg rounded-lg bg-[var(--secondary-background)] p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--primary-text)]">Edit Student</h2>
                            <button onClick={() => setIsEditStudentModalOpen(false)} className="cursor-pointer rounded-full p-1 text-[var(--secondary-text)] transition-colors hover:bg-red-600 hover:text-white"><IoClose className="h-6 w-6" /></button>
                        </div>
                        <form onSubmit={handleUpdateStudent}>
                            {editStudentError && <p className="mb-4 text-center text-sm text-red-500">{editStudentError}</p>}
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                <div className="flex flex-col items-center">
                                    <label className="mb-2 block text-sm font-medium text-[var(--secondary-text)]">Student Photo</label>
                                    <div className="flex h-40 w-40 items-center justify-center rounded-lg border-2 border-dashed border-[var(--primary-text)] bg-[var(--primary-background)]">
                                        {editPhotoPreview ? (
                                            <img src={editPhotoPreview} alt="Preview" className="h-full w-full rounded-lg object-cover" />
                                        ) : (
                                            <span className="text-sm text-[var(--secondary-text)]">Current/Preview</span>
                                        )}
                                    </div>
                                    <input type="file" id="editPhotoUpload" accept="image/*" onChange={handleEditPhotoChange} className="hidden" />
                                    <label htmlFor="editPhotoUpload" className="mt-4 cursor-pointer rounded-md border border-[var(--secondary-text)] px-4 py-2 text-sm font-semibold text-[var(--primary-text)] transition hover:opacity-90">Change Photo</label>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Full Name</label>
                                        <input type="text" value={editStudentName} onChange={(e) => setEditStudentName(e.target.value)} className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Roll Number</label>
                                        <input type="number" value={editStudentRollNo} onChange={(e) => setEditStudentRollNo(e.target.value)} className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]" />
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-sm font-medium text-[var(--secondary-text)]">Gender</label>
                                        <select value={editStudentGender} onChange={(e) => setEditStudentGender(e.target.value)} className="w-full rounded-md border border-[var(--secondary-text)] bg-[var(--primary-background)] p-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]">
                                            <option>Male</option>
                                            <option>Female</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-4">
                                <button type="button" onClick={() => setIsEditStudentModalOpen(false)} className="cursor-pointer rounded-lg bg-[var(--secondary-background)] px-4 py-2 font-semibold text-[var(--primary-text)] transition hover:opacity-90 border border-[var(--secondary-text)]">Cancel</button>
                                <button type="submit" className="cursor-pointer rounded-lg bg-[var(--accent-color)] px-4 py-2 font-semibold text-white transition hover:opacity-90">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}