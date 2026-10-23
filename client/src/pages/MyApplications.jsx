import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  MapPin,
  RefreshCw,
  Search,
} from "lucide-react";
import api from "../lib/api";
import Navbar from "../components/Navbar";

const statusStyles = {
  pending: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  reviewed: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  shortlisted:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  hired:
    "bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300",
};

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/applications/my");
      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : data?.applications || data?.data || [];

      setApplications(Array.isArray(list) ? list : []);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Could not load your applications. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const getJob = (application) => {
    const job = application.job || application.jobId;

    return job && typeof job === "object" ? job : null;
  };

  const getStatus = (application) => {
    return String(application.status || "pending").toLowerCase();
  };

  return (
    <>
      {/* Navbar stays visible on every My Applications state */}
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 transition-colors sm:px-6 lg:px-8 dark:bg-slate-950 dark:text-white">
        <div className="mx-auto max-w-5xl">
          <Link
            to="/candidate/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={17} />
            Back to Dashboard
          </Link>

          <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                My Applications
              </h1>

              <p className="mt-2 text-slate-600 dark:text-slate-400">
                Track the jobs you have applied for and check their status.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchApplications}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {/* Application statistics */}
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Total Applications
              </p>
              <p className="mt-2 text-3xl font-bold">{applications.length}</p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Shortlisted
              </p>
              <p className="mt-2 text-3xl font-bold text-emerald-600">
                {
                  applications.filter(
                    (application) => getStatus(application) === "shortlisted",
                  ).length
                }
              </p>
            </div>

            <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-1 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pending
              </p>
              <p className="mt-2 text-3xl font-bold text-amber-600">
                {
                  applications.filter(
                    (application) => getStatus(application) === "pending",
                  ).length
                }
              </p>
            </div>
          </div>

          {/* Loading, error, empty and application-list states */}
          <div className="mt-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-16 dark:border-slate-800 dark:bg-slate-900">
                <RefreshCw size={30} className="animate-spin text-indigo-600" />
                <p className="mt-4 text-slate-600 dark:text-slate-300">
                  Loading your applications...
                </p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-white px-6 py-12 text-center dark:border-red-900 dark:bg-slate-900">
                <p className="font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchApplications}
                  className="mt-4 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  Try Again
                </button>
              </div>
            ) : applications.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center dark:border-slate-700 dark:bg-slate-900">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
                  <BriefcaseBusiness size={27} />
                </div>

                <h2 className="mt-5 text-xl font-bold">No applications yet</h2>

                <p className="mx-auto mt-2 max-w-md text-slate-600 dark:text-slate-400">
                  Explore available jobs and apply for a role that matches your
                  skills.
                </p>

                <Link
                  to="/jobs"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Search size={18} />
                  Explore Jobs
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => {
                  const job = getJob(application);
                  const status = getStatus(application);

                  const jobId =
                    job?._id ||
                    (typeof application.jobId === "string"
                      ? application.jobId
                      : null);

                  const title =
                    job?.title || application.jobTitle || "Job details";

                  const company =
                    job?.company || application.company || "Company";

                  const location = job?.location || "Location not specified";

                  return (
                    <article
                      key={application._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-indigo-200 sm:p-6 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900"
                    >
                      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                        <div className="flex items-start gap-4">
                          <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                            <BriefcaseBusiness size={23} />
                          </div>

                          <div className="min-w-0">
                            <h2 className="break-words text-lg font-bold">
                              {title}
                            </h2>

                            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                              {company}
                            </p>

                            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin size={15} />
                                {location}
                              </span>

                              <span className="inline-flex items-center gap-1.5">
                                <CalendarDays size={15} />
                                Applied:{" "}
                                {formatDate(
                                  application.createdAt ||
                                    application.appliedAt,
                                )}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${
                            statusStyles[status] ||
                            "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      {jobId && (
                        <div className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800">
                          <Link
                            to={`/jobs/${jobId}`}
                            className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                          >
                            View Job Details →
                          </Link>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default MyApplications;
