import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { useClassrooms } from "../context/ClassroomContext"; // 👈 1. Import context

export default function PrincipalDashboard() {
    const navigate = useNavigate(); // 👈 2. Initialize navigate
    const { classrooms } = useClassrooms(); // 👈 3. Get classrooms from context

    // Helper: create slug like "9A" from "Class 9 - Section A"
    const createClassSlug = (name) => {
        return name.replace(/Class|Section|-/gi, "").replace(/\s+/g, "");
    };

    const handleClassClick = (classroom) => {
        const slug = createClassSlug(classroom.name);
        navigate(`/principal/${slug}`);
    };

    return (
        <div className="min-h-screen bg-[var(--primary-background)]">
            <Navbar />
            
            <main className="p-8">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-[var(--primary-text)]">Principal Dashboard</h1>
                    <p className="mt-1 text-[var(--secondary-text)]">Oversee all classroom activity and generate reports.</p>
                </header>

                <h2 className="mb-4 text-xl font-semibold text-[var(--secondary-text)]">All Classrooms</h2>
                {classrooms.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {classrooms.map((classroom) => (
                            <div 
                                key={classroom.id}
                                onClick={() => handleClassClick(classroom)}
                                className="cursor-pointer rounded-lg bg-[var(--secondary-background)] p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                            >
                                <h3 className="text-lg font-bold text-[var(--primary-text)]">{classroom.name}</h3>
                                {/* Teacher info would come from context/API in a real app */}
                                <p className="mt-2 text-sm text-[var(--secondary-text)]">
                                    Click to view details
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="mt-10 text-center">
                        <p className="text-[var(--secondary-text)]">No classrooms have been created in the school yet.</p>
                    </div>
                )}
            </main>
        </div>
    );
}