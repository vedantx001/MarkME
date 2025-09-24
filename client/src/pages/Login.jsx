import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // Assuming you have this context

export default function Login() {
    // State for toggling between forms
    const [isSignUp, setIsSignUp] = useState(false);

    // Form fields state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("teacher"); // default role
    const [schoolId, setSchoolId] = useState("");

    // Helper states
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(""); // For showing success message on signup

    const navigate = useNavigate();
    const { login, signup } = useAuth(); // Using context methods

    const toggleForm = () => {
        setIsSignUp(!isSignUp);
        setError("");
        setSuccess("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (isSignUp) {
            // --- SIGN UP LOGIC ---
            try {
                if (!name || !email || !password || !role || !schoolId) {
                    setError("Please fill in all fields");
                    return;
                }
                await signup({ name, email, password, role, schoolId: Number(schoolId) });
                setSuccess("Account created successfully! Please log in.");
                setIsSignUp(false); // Switch back to login form after successful signup
            } catch (err) {
                setError(err?.message || "Failed to create account");
            }

        } else {
            // --- LOGIN LOGIC ---
            try {
                if (!email || !password) {
                    setError("Please fill in all fields");
                    return;
                }
                const userData = await login({ email, password });
                if (userData.role === "teacher") {
                    navigate("/teacher");
                } else {
                    navigate("/principal");
                }
            } catch (err) {
                setError(err?.message || "Login failed");
            }
        }
    };

    return (
        <div className="flex min-h-screen font-sans bg-[var(--primary-background)]">
            {/* Left side - Informational Panel */}
            <div className="hidden w-1/2 flex-col justify-center bg-[var(--accent-color)] p-10 text-white md:flex">
                <h1 className="mb-8 text-5xl font-bold">Smart Attendance</h1>
                
                <div className="space-y-6">
                    <div className="flex items-start rounded-lg bg-white/20 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-4 h-7 w-7 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                        <div>
                            <h3 className="font-semibold">For the Modern Classroom</h3>
                            <p className="text-sm">Empowering teachers with a simple tool for accurate attendance.</p>
                        </div>
                    </div>
                     <div className="flex items-start rounded-lg bg-white/20 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-4 h-7 w-7 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        <div>
                            <h3 className="font-semibold">Effortless & Fast</h3>
                            <p className="text-sm">Capture one class photo to mark attendance in seconds.</p>
                        </div>
                    </div>
                    <div className="flex items-start rounded-lg bg-white/20 p-4">
                       <svg xmlns="http://www.w3.org/2000/svg" className="mr-4 h-7 w-7 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        <div>
                            <h3 className="font-semibold">Teacher-Centric Control</h3>
                            <p className="text-sm">Easily review and edit the attendance list before final submission.</p>
                        </div>
                    </div>
                    <div className="flex items-start rounded-lg bg-white/20 p-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mr-4 h-7 w-7 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        <div>
                            <h3 className="font-semibold">Insightful Reports</h3>
                            <p className="text-sm">Generate and download weekly or monthly reports with one click.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right side - Form */}
            <div className="flex w-full items-center justify-center bg-[var(--primary-background)] p-4 md:w-1/2">
                <div className="w-full max-w-md">
                    <form
                        onSubmit={handleSubmit}
                        className="rounded-xl bg-[var(--secondary-background)] p-8 shadow-2xl"
                    >
                        <h2 className="mb-6 text-center text-3xl font-bold text-[var(--primary-text)]">
                            {isSignUp ? "Create an Account" : "Welcome Back"}
                        </h2>

                        {error && <p className="mb-4 text-center text-sm text-red-500">{error}</p>}
                        {success && <p className="mb-4 text-center text-sm text-green-500">{success}</p>}

                        {/* Name Input (Sign Up only) */}
                        {isSignUp && (
                            <div className="relative mb-4">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--secondary-text)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                                </span>
                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full rounded-lg border bg-[var(--primary-background)] py-2 pl-10 pr-4 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                                />
                            </div>
                        )}

                        {/* School ID (Sign Up only) */}
                        {isSignUp && (
                            <div className="relative mb-4">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--secondary-text)]" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 01.894.553l7 14A1 1 0 0119 18H5a1 1 0 01-.894-1.447l7-14A1 1 0 0112 2z" /><path d="M11 13h2v5h-2z" /></svg>
                                </span>
                                <input
                                    type="number"
                                    placeholder="School ID"
                                    value={schoolId}
                                    onChange={(e) => setSchoolId(e.target.value)}
                                    className="w-full rounded-lg border bg-[var(--primary-background)] py-2 pl-10 pr-4 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                                />
                            </div>
                        )}

                        {/* Email Input */}
                        <div className="relative mb-4">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--secondary-text)]" viewBox="0 0 20 20" fill="currentColor"><path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" /><path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" /></svg>
                                      </span>
                            <input
                                type="email"
                                placeholder="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                          className="w-full rounded-lg border bg-[var(--primary-background)] py-2 pl-10 pr-4 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative mb-4">
                                      <span className="absolute left-3 top-1/2 -translate-y-1/2">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-[var(--secondary-text)]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
                                      </span>
                            <input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                          className="w-full rounded-lg border bg-[var(--primary-background)] py-2 pl-10 pr-4 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                            />
                        </div>

                        {/* Role Selection */}
                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-semibold text-[var(--secondary-text)]">{isSignUp ? "Sign Up As" : "Login As"}</label>
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                className="w-full cursor-pointer rounded-lg border bg-[var(--secondary-background)] px-4 py-2 text-[var(--primary-text)] focus:border-[var(--accent-color)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-color)]"
                            >
                                <option value="teacher">Teacher</option>
                                <option value="principal">Principal</option>
                            </select>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full cursor-pointer rounded-lg bg-[var(--accent-color)] py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {isSignUp ? "Sign Up" : "Login"}
                        </button>

                        {/* Toggle Link */}
                        <p className="mt-6 text-center text-sm text-[var(--secondary-text)]">
                            {isSignUp ? "Already have an account?" : "Don't have an account?"}
                            <span
                                onClick={toggleForm}
                                className="ml-2 cursor-pointer font-semibold text-[var(--accent-color)] hover:underline"
                            >
                                {isSignUp ? "Login" : "Sign Up"}
                            </span>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}