import { Link, useLocation } from "react-router-dom";
import { AlertTriangle } from "lucide-react";

const ErrorPage = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-(--secondary-bg) flex items-center justify-center p-6">
      <div className="w-full max-w-xl bg-(--primary-bg) border border-[rgb(var(--primary-accent-rgb)/0.08)] rounded-3xl shadow-sm p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-(--secondary-bg) text-(--secondary-accent)">
            <AlertTriangle size={22} />
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold text-(--primary-text)">Something went wrong</h1>
            <p className="text-sm text-(--primary-accent) opacity-70 mt-1">
              We couldn’t complete your request.
            </p>
            <p className="text-xs text-(--primary-accent) opacity-55 mt-3 break-words">
              Path: <span className="font-semibold">{location.pathname}</span>
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

        <div className="mt-6 text-xs text-(--primary-accent) opacity-60">
          Tip: If this keeps happening, refresh the page or sign in again.
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
