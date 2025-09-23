import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useClassrooms } from "../context/ClassroomContext";

export default function PrincipalClassroomView() {
    const { classId } = useParams();
    const { classrooms } = useClassrooms();

    // Helpers to compute slug and a nice display name from slug
    const createClassSlug = (name) => name.replace(/Class|Section|-/gi, "").replace(/\s+/g, "");
    const toDisplayNameFromSlug = (slug) => {
        const s = String(slug).toUpperCase().replace(/\s+/g, "");
        const m = s.match(/^(\d+)([A-Z]+)$/);
        if (m) return `Class ${m[1]} - Section ${m[2]}`;
        return slug;
    };

    // Find classroom by slug (e.g., 9A) and compute display name fallback
    const match = classrooms.find(c => createClassSlug(c.name).toUpperCase() === String(classId).toUpperCase());
    const displayName = match ? match.name : toDisplayNameFromSlug(classId);

    return (
        <div className="min-h-screen bg-[var(--primary-background)]">
            <Navbar />
            <main className="p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--primary-text)]">
                        Viewing Classroom: <span className="text-[var(--accent-color)]">{displayName}</span>
                    </h1>
                    <p className="mt-1 text-[var(--secondary-text)]">This is a read-only view of the student list and attendance records.</p>
                </header>

                <div className="rounded-lg bg-[var(--secondary-background)] p-6 shadow-lg">
                    <h2 className="mb-4 text-xl font-semibold text-[var(--primary-text)]">Student List</h2>
                    {/* In the future, you'll fetch and display the student list for this class here */}
                    <p className="mt-4 text-center text-[var(--secondary-text)]">Student attendance data for this class will be displayed here.</p>
                </div>
            </main>
        </div>
    );
}