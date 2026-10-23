import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BriefcaseBusiness,
  FileText,
  Search,
  UserRound,
  ArrowRight,
  RefreshCw,
  Pencil,
} from "lucide-react";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

function CandidateDashboard() {
  const { user } = useAuth();

  const [applicationCount, setApplicationCount] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const results = await Promise.allSettled([
        api.get("/applications/my"),
        api.get("/users/profile"),
      ]);

      const applicationsResult = results[0];
      const profileResult = results[1];

      if (applicationsResult.status === "fulfilled") {
        const data = applicationsResult.value.data;
        const applications = Array.isArray(data)
          ? data
          : data.applications || data.data || [];

        setApplicationCount(
          Array.isArray(applications) ? applications.length : 0,
        );
      } else {
        console.error(
          "Failed to load application count:",
          applicationsResult.reason,
        );
        setApplicationCount(0);
      }

      if (profileResult.status === "fulfilled") {
        setProfileCompletion(
          profileResult.value.data.user?.profileCompletion ?? 0,
        );
      } else {
        console.error(
          "Failed to load profile completion:",
          profileResult.reason,
        );
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      label: "Available Jobs",
      value: "Explore",
      icon: BriefcaseBusiness,
      color:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300",
      link: "/jobs",
    },
    {
      label: "My Applications",
      value: applicationCount,
      icon: FileText,
      color:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
      link: "/candidate/applications",
    },
    {
      label: "Profile Completion",
      value: profileCompletion === null ? null : `${profileCompletion}%`,
      icon: UserRound,
      color:
        "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
      link: "/candidate/profile",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:p-10">
          <p className="text-sm font-medium text-indigo-100">
            Candidate Dashboard
          </p>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Welcome, {user?.name || "Candidate"}!
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 sm:text-base">
            Discover opportunities, track your applications, and take the next
            step in your career.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-semibold text-indigo-700 transition hover:bg-indigo-50"
            >
              <Search size={18} />
              Explore Jobs
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/candidate/applications"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              <FileText size={18} />
              My Applications
              <ArrowRight size={18} />
            </Link>

            <Link
              to="/candidate/profile"
              className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 font-semibold text-white transition hover:bg-white/10"
            >
              <Pencil size={18} />
              Edit Profile
            </Link>
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon;

            const content = (
              <article className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-colors dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {stat.label}
                    </p>

                    <h2 className="mt-3 text-xl font-bold">
                      {stat.value === null ? (
                        <RefreshCw
                          size={20}
                          className="animate-spin text-indigo-600"
                        />
                      ) : (
                        stat.value
                      )}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={23} />
                  </div>
                </div>

                {stat.label === "Profile Completion" &&
                  profileCompletion !== null && (
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{ width: `${profileCompletion}%` }}
                      />
                    </div>
                  )}
              </article>
            );

            return (
              <Link
                key={stat.label}
                to={stat.link}
                className="block rounded-2xl outline-none transition hover:-translate-y-0.5 hover:shadow-md focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                {content}
              </Link>
            );
          })}
        </section>

        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <h2 className="text-xl font-bold">Your next steps</h2>

          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Complete your profile, explore jobs that match your skills, and keep
            track of your application progress.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/candidate/profile"
              className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Complete Profile
            </Link>

            <Link
              to="/jobs"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Browse Jobs
            </Link>

            <Link
              to="/candidate/applications"
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Track Applications
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

export default CandidateDashboard;
