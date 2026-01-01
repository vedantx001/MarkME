import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-(--secondary-bg) flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-(--primary-bg) border border-[rgb(var(--primary-accent-rgb)/0.08)] rounded-3xl shadow-sm p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-(--secondary-bg) text-red-600">
            <ShieldAlert size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-(--primary-text)">Access denied</h1>
            <p className="text-sm text-(--primary-accent) opacity-70 mt-1">
              You don’t have permission to view this page.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-(--primary-accent) text-(--primary-bg) font-bold hover:bg-(--primary-text) transition-colors"
          >
            Go Home
          </Link>
          <Link
            to="/login"
            className="px-4 py-2 rounded-xl border border-[rgb(var(--primary-accent-rgb)/0.15)] bg-(--primary-bg) text-(--primary-accent) font-bold hover:bg-(--secondary-bg) transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Forbidden;
