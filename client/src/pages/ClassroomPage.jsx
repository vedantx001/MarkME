import { useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { IoClose } from "react-icons/io5";
import { FaTrash, FaCamera, FaImage, FaUsers, FaClipboardList } from "react-icons/fa";
import { useClassrooms } from "../context/ClassroomContext";

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
    const { classrooms, deleteClassroom } = useClassrooms();

    const currentClassroom = classrooms.find(c => createClassSlug(c.name).toUpperCase() === String(classId).toUpperCase());
    const displayName = currentClassroom ? currentClassroom.name : toDisplayNameFromSlug(classId);
    
    // State to manage the active view ("students" or "attendance")
    const [activeView, setActiveView] = useState("students");
    
    // Mock Data for Students
    const [students, setStudents] = useState([
        { id: 101, name: 'Aarav Patel', rollNo: '01', gender: 'Male', photoUrl: 'https://i.pravatar.cc/150?u=101' },
        { id: 102, name: 'Priya Sharma', rollNo: '02', gender: 'Female', photoUrl: 'https://i.pravatar.cc/150?u=102' },
        { id: 103, name: 'Rohan Mehta', rollNo: '03', gender: 'Male', photoUrl: 'https://i.pravatar.cc/150?u=103' },
    ]);
    
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
    const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
    const attendanceFileInputRef = useRef(null);
    const [newStudentName, setNewStudentName] = useState("");
    const [newStudentRollNo, setNewStudentRollNo] = useState("");
    const [newStudentGender, setNewStudentGender] = useState("Male");
    const [newStudentPhoto, setNewStudentPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");
    const [error, setError] = useState("");

    // --- Handlers ---
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setNewStudentPhoto(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };
    
    const handleAddStudent = (e) => {
        e.preventDefault();
        if (!newStudentName.trim() || !newStudentRollNo.trim() || !newStudentPhoto) {
            setError("All fields, including a photo, are required.");
            return;
        }
        const newStudent = { id: Date.now(), name: newStudentName, rollNo: newStudentRollNo, gender: newStudentGender, photoUrl: photoPreview };
        setStudents([...students, newStudent]);
        closeModal();
    };
    
    const handleDeleteStudent = (studentId) => {
        if (window.confirm("Are you sure you want to delete this student?")) {
            setStudents(students.filter(student => student.id !== studentId));
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
                            {students.length > 0 ? (
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
                                                <td className="p-3"><img src={student.photoUrl} alt={student.name} className="h-12 w-12 rounded-full object-cover" /></td>
                                                <td className="p-3 font-medium">{student.rollNo}</td>
                                                <td className="p-3">{student.name}</td>
                                                <td className="p-3 text-[var(--secondary-text)]">{student.gender}</td>
                                                <td className="p-3 text-right">
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
        </div>
    );
}