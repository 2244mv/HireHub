import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Registration ke baad aayi email ko automatically fill karo
  const registeredEmail = location.state?.email || "";

  const [formData, setFormData] = useState({
    email: registeredEmail,
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const email = formData.email.trim().toLowerCase();

    if (!email || !formData.password) {
      toast.error("Please enter your email and password");
      return;
    }

    setLoading(true);

    try {
      const response = await login({
        email,
        password: formData.password,
      });

      toast.success("Login successful!");

      const loggedInUser = response.user;

      const dashboardPath =
        loggedInUser.role === "recruiter"
          ? "/recruiter/dashboard"
          : "/candidate/dashboard";

      const requestedPath = location.state?.from;

      // Requested route ko tabhi use karo jab woh logged-in user ke role ke liye allowed ho.
      const isRecruiter = loggedInUser.role === "recruiter";

      const allowedPrefixes = isRecruiter ? ["/recruiter/"] : ["/candidate/"];

      const requestedUrl =
        requestedPath &&
        typeof requestedPath.pathname === "string" &&
        allowedPrefixes.some((prefix) =>
          requestedPath.pathname.startsWith(prefix),
        )
          ? `${requestedPath.pathname}${requestedPath.search || ""}${requestedPath.hash || ""}`
          : dashboardPath;

      navigate(requestedUrl, { replace: true });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10 transition-colors dark:bg-slate-950">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2">
          <span className="rounded-xl bg-indigo-600 p-2.5 text-white">
            <BriefcaseBusiness size={24} />
          </span>

          <span className="text-2xl font-bold text-slate-900 dark:text-white">
            Hire<span className="text-indigo-600">Hub</span>
          </span>
        </Link>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/40 sm:p-8 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to continue your career journey.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-slate-700 dark:text-slate-200"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute top-1/2 left-4 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`${inputClass} pr-12`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute top-1/2 right-3 -translate-y-1/2 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              Create account
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}

export default Login;
