import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 👈 1. Import useNavigate
import Navbar from "../components/Navbar";
import { IoClose } from "react-icons/io5";
import { useClassrooms } from "../context/ClassroomContext";
import { useAuth } from "../context/AuthContext";

// Helper function to create a URL-friendly slug from the class name
const createClassSlug = (name) => {
    return name.replace(/Class|Section|-/gi, "").replace(/\s+/g, "");
};

export default function TeacherDashboard() {
    const navigate = useNavigate(); // 👈 2. Initialize the navigate function
    const { classrooms, createClassroom } = useClassrooms();
    const { user } = useAuth();
    const myClassrooms = user ? classrooms.filter(c => String(c.teacherId) === String(user._id)) : [];
    const hasClassroom = myClassrooms.length > 0;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [standard, setStandard] = useState("");
    const [division, setDivision] = useState("");
    const [error, setError] = useState("");

    const handleCreateClass = async (e) => {
        e.preventDefault();
        setError("");
        if (!standard || !division) {
            setError("Please provide standard and division.");
            return;
        }
        try {
            await createClassroom({ standard, division });
            setIsModalOpen(false);
            setStandard("");
            setDivision("");
        } catch (err) {
            const msg = err?.response?.data?.error || err?.response?.data?.msg || err?.message || "Failed to create classroom";
            setError(msg);
        }
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
                        disabled={hasClassroom}
                        className={`flex items-center gap-2 rounded-lg px-4 py-2 font-semibold text-white shadow-md transition-transform duration-200 ${hasClassroom ? 'bg-gray-400 cursor-not-allowed' : 'bg-[var(--accent-color)] cursor-pointer hover:opacity-90 hover:scale-105'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
                        {hasClassroom ? 'Classroom Already Created' : 'Create New Class'}
                    </button>
                </header>

                <h2 className="mb-4 ml-4 text-xl font-semibold text-[var(--secondary-text)]">Your Classroom</h2>
                {myClassrooms.length > 0 ? (
                    <div className="grid grid-cols-1 gap-8 pl-8 pt-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {myClassrooms.map((classroom) => (
                            // 👇 4. Added onClick handler to this div
                            <div 
                                key={classroom.id} 
                                onClick={() => handleClassClick(classroom)}
                                className="cursor-pointer rounded-lg bg-[var(--secondary-background)] p-6 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
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
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                    <div>
                                        <label htmlFor="standard" className="mb-2 block text-sm font-medium text-[var(--secondary-text)]">Standard</label>
                                        <input
                                            type="number"
                                            id="standard"
                                            value={standard}
                                            onChange={(e) => setStandard(e.target.value)}
                                            placeholder="e.g., 8"
                                            className="w-full rounded-lg border bg-[var(--primary-background)] py-2 px-4 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="division" className="mb-2 block text-sm font-medium text-[var(--secondary-text)]">Division</label>
                                        <input
                                            type="text"
                                            id="division"
                                            value={division}
                                            onChange={(e) => setDivision(e.target.value.toUpperCase())}
        
                                            placeholder="e.g., A"
                                            className="w-full rounded-lg border bg-[var(--primary-background)] py-2 px-4 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                                        />
                                    </div>
                                </div>
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