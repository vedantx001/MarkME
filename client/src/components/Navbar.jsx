import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Make sure the path is correct

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login"); // Redirect to login page after logout
    };

    return (
        <nav className="flex items-center justify-between bg-[var(--secondary-background)] px-8 py-4 shadow-md">
            {/* Left Side - Brand */}
            <div className="flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[var(--accent-color)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h1 className="text-2xl font-bold text-[var(--primary-text)]">MarkME</h1>
            </div>

            {/* Right Side - User and Logout */}
            <div className="flex items-center gap-4">
                <div className="text-right">
                    {/* Display user's email or name */}
                    <p className="text-sm font-medium text-[var(--primary-text)]">{user?.email || "user@example.com"}</p>
                    <p className="text-xs capitalize text-[var(--secondary-text)]">{user?.role || "Role"}</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-[var(--secondary-text)] bg-[var(--secondary-background)] px-3 py-2 text-sm font-semibold text-[var(--primary-text)] transition-colors duration-200 hover:bg-red-600 hover:text-white"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" /></svg>
                    Logout
                </button>
            </div>
        </nav>
    );
}