import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Sun,
  Moon,
  LogOut,
  UserRound,
  Menu,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = String(user?.role || "").toLowerCase();
  const isRecruiter = role === "recruiter";

  const dashboardPath = isRecruiter
    ? "/recruiter/dashboard"
    : "/candidate/dashboard";

  const closeMenu = () => setMobileOpen(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname, location.search, location.hash]);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      await logout();
      closeMenu();
      toast.success("Logged out successfully");
      navigate("/", { replace: true });
    } catch {
      toast.error("Logout failed. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  const linkClass =
    "inline-flex min-h-8 items-center text-sm font-medium text-slate-600 transition hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:text-indigo-400";

  const dashboardLinks = (
    <>
      <Link
        to={dashboardPath}
        onClick={closeMenu}
        className={linkClass}
      >
        Dashboard
      </Link>

      {isRecruiter ? (
        <Link
          to="/recruiter/jobs/new"
          onClick={closeMenu}
          className={linkClass}
        >
          Post a Job
        </Link>
      ) : (
        <>
          <Link
            to="/jobs"
            onClick={closeMenu}
            className={linkClass}
          >
            Explore Jobs
          </Link>

          <Link
            to="/candidate/applications"
            onClick={closeMenu}
            className={linkClass}
          >
            My Applications
          </Link>

          <Link
            to="/candidate/profile"
            onClick={closeMenu}
            className={linkClass}
          >
            My Profile
          </Link>
        </>
      )}
    </>
  );

  const themeButton = (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
      title={theme === "dark" ? "Light mode" : "Dark mode"}
      className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
    >
      {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
    </button>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8"
      >
        <Link
          to={!loading && user ? dashboardPath : "/"}
          onClick={closeMenu}
          aria-label="HireHub home"
          className="flex min-w-0 shrink-0 items-center gap-2"
        >
          <span className="rounded-xl bg-indigo-600 p-2 text-white">
            <BriefcaseBusiness size={22} />
          </span>

          <span className="text-xl font-bold text-slate-900 dark:text-white">
            Hire<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        <div className="hidden items-center gap-5 lg:flex xl:gap-6">
          {!loading && user ? (
            dashboardLinks
          ) : !loading ? (
            <>
              <Link to="/#features" className={linkClass}>
                Features
              </Link>

              <Link to="/#how-it-works" className={linkClass}>
                How It Works
              </Link>

              <Link to="/jobs" className={linkClass}>
                Explore Jobs
              </Link>
            </>
          ) : null}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          {themeButton}

          {!loading && user ? (
            <>
              <div className="flex max-w-52 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 dark:border-slate-700">
                <UserRound
                  size={19}
                  className="shrink-0 text-indigo-600"
                />

                <div className="min-w-0">
                  <p className="max-w-32 truncate text-sm font-semibold text-slate-900 dark:text-white">
                    {user.name || "User"}
                  </p>

                  <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                    {role}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
              >
                <LogOut size={17} />
                {loggingOut ? "Logging out..." : "Logout"}
              </button>
            </>
          ) : !loading ? (
            <>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="inline-flex min-h-11 items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                Sign Up
              </Link>
            </>
          ) : null}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 lg:hidden">
          {themeButton}

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-700 transition hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div
          id="mobile-navigation"
          className="border-t border-slate-200 bg-white px-5 py-5 dark:border-slate-800 dark:bg-slate-950 lg:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-5">
            {!loading && user ? (
              <>
                <div className="flex flex-col items-start gap-4">
                  {dashboardLinks}
                </div>

                <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
                  <p className="break-words font-semibold text-slate-900 dark:text-white">
                    {user.name || "User"}
                  </p>

                  <p className="break-all text-sm text-slate-500 dark:text-slate-400">
                    {user.email}
                  </p>

                  <p className="mt-1 text-xs capitalize text-slate-500 dark:text-slate-400">
                    {role}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:hover:bg-red-950"
                >
                  <LogOut size={17} />
                  {loggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : !loading ? (
              <>
                <Link
                  to="/#features"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  Features
                </Link>

                <Link
                  to="/#how-it-works"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  How It Works
                </Link>

                <Link
                  to="/jobs"
                  onClick={closeMenu}
                  className={linkClass}
                >
                  Explore Jobs
                </Link>

                <Link
                  to="/login"
                  onClick={closeMenu}
                  className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-center font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={closeMenu}
                  className="flex min-h-11 items-center justify-center rounded-xl bg-indigo-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-indigo-700"
                >
                  Sign Up
                </Link>
              </>
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading navigation...
              </p>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

