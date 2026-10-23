import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Jab tak backend se session check ho raha hai
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Checking your session...
          </p>
        </div>
      </div>
    );
  }

  // Login nahi hai to login page par bhejo
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // Role allowed nahi hai to apne dashboard par bhejo
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const correctDashboard =
      user.role === "recruiter"
        ? "/recruiter/dashboard"
        : "/candidate/dashboard";

    return <Navigate to={correctDashboard} replace />;
  }

  // Sab checks pass hue to requested page render karo
  return <Outlet />;
}

export default ProtectedRoute;

