import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 1. Import useNavigate
import Navbar from "../components/Navbar";
import { IoClose } from "react-icons/io5";

// Helper function to create a URL-friendly slug from the class name
const createClassSlug = (name) => {
    return name.replace(/Class|Section|-/gi, "").replace(/\s+/g, "");
};

export default function TeacherDashboard() {
    const navigate = useNavigate(); // 👈 2. Initialize the navigate function

    const [classrooms, setClassrooms] = useState([
        { id: 1, name: "Class 6 - Section A" },
        { id: 2, name: "Class 7 - Section B" },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newClassName, setNewClassName] = useState("");
    const [error, setError] = useState("");

    const handleCreateClass = (e) => {
        e.preventDefault();
        if (!newClassName.trim()) {
            setError("Class name cannot be empty.");
            return;
        }
        const newClass = { id: Date.now(), name: newClassName };
        setClassrooms([...classrooms, newClass]);
        setIsModalOpen(false);
        setNewClassName("");
        setError("");
    };

    // 👇 3. Function to handle clicking a classroom card
    const handleClassClick = (classroom) => {
        const slug = createClassSlug(classroom.name);
        navigate(`/teacher/${slug}`); // Navigates to the dynamic route
    };

    return (
        <div className="min-h-screen bg-[var(--primary-background)]">
            <Navbar />
            
            <main className="p-8">
                <header className="mb-8 flex items-center justify-between">
                    <h1 className="text-3xl font-bold text-[var(--primary-text)]">Dashboard</h1>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--accent-color)] px-4 py-2 font-semibold text-white shadow-md transition-transform duration-200 hover:opacity-90 hover:scale-105"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        Create New Class
                    </button>
                </header>

                <h2 className="mb-4 text-xl font-semibold text-[var(--secondary-text)]">Your Classrooms</h2>
                {classrooms.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {classrooms.map((classroom) => (
                            // 👇 4. Added onClick handler to this div
                            <div 
                                key={classroom.id} 
                                onClick={() => handleClassClick(classroom)}
                                className="cursor-pointer rounded-lg bg-[var(--secondary-background)] p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <h3 className="text-lg font-bold text-[var(--primary-text)]">{classroom.name}</h3>
                                <p className="mt-2 text-sm text-[var(--secondary-text)]">Manage students and attendance.</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 text-center">
                        <p className="text-[var(--secondary-text)]">You haven't created any classrooms yet.</p>
                        <p className="text-[var(--secondary-text)]">Click "Create New Class" to get started.</p>
                    </div>
                )}
            </main>

            {/* Create Class Modal */}
            {isModalOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent bg-opacity-50 backdrop-blur-md">
                    <div className="relative w-full max-w-md rounded-lg bg-[var(--secondary-background)] p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-[var(--primary-text)]">Create a New Classroom</h2>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="cursor-pointer rounded-full p-1 text-[var(--secondary-text)] transition-colors hover:bg-red-500 hover:text-white"
                            >
                                <IoClose className="h-6 w-6" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateClass}>
                            <div className="mb-4">
                                <label htmlFor="className" className="mb-2 block text-sm font-medium text-[var(--secondary-text)]">Class Name</label>
                                <input
                                    type="text"
                                    id="className"
                                    value={newClassName}
                                    onChange={(e) => setNewClassName(e.target.value)}
                                    placeholder="e.g., Class 8 - Section C"
                                    className="w-full rounded-lg border bg-[var(--primary-background)] py-2 px-4 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                                />
                                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="cursor-pointer rounded-lg border border-[var(--secondary-text)] bg-[var(--secondary-background)] px-4 py-2 font-semibold text-[var(--primary-text)] transition hover:opacity-90 hover:bg-red-600 hover:text-white">Cancel</button>
                                <button type="submit" className="cursor-pointer rounded-lg bg-[var(--accent-color)] px-4 py-2 font-semibold text-white transition hover:opacity-90">Save Class</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}