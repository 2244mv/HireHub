import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  BriefcaseBusiness,
  Building2,
  IndianRupee,
  Users,
  CalendarDays,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import api from "../lib/api";

const formatSalary = (amount) => {
  if (amount == null || amount === "") return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatLabel = (value) => {
  if (!value) return "Not specified";

  return value
    .replaceAll("-", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatDate = (date) => {
  if (!date) return "Not specified";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not specified";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchJobDetails = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get(`/jobs/${id}`);
      setJob(response.data.job);
    } catch (err) {
      setJob(null);
      setError(
        err.response?.data?.message ||
          "Job details load nahi ho paayi. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let cancelled = false;

    const loadJob = async () => {
      setLoading(true);
      setError("");
      setJob(null);

      try {
        const response = await api.get(`/jobs/${id}`);

        if (!cancelled) {
          setJob(response.data.job);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
              "Job details load nahi ho paayi. Please try again.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadJob();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleBack = () => {
    navigate("/jobs");
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <div className="text-center">
          <LoaderCircle
            size={36}
            aria-hidden="true"
            className="mx-auto animate-spin text-violet-600"
          />
          <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
            Loading job details...
          </p>
        </div>
      </main>
    );
  }

  if (error || !job) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 py-10 text-center dark:bg-gray-950">
        <Building2
          size={44}
          aria-hidden="true"
          className="mb-4 text-gray-400"
        />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job unavailable
        </h1>

        <p className="mt-3 max-w-md break-words text-sm leading-6 text-gray-600 dark:text-gray-400">
          {error || "This job may no longer be available."}
        </p>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            <ArrowLeft size={18} />
            Browse Jobs
          </button>

          <button
            type="button"
            onClick={fetchJobDetails}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            <RefreshCw size={17} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 sm:px-4"
          >
            <ArrowLeft size={18} />
            Back to Jobs
          </button>

          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-violet-600 transition hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40"
          >
            HireHub
          </Link>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          {/* Job heading */}
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 sm:h-14 sm:w-14 sm:rounded-2xl">
              <Building2 size={26} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="break-words text-2xl font-bold sm:text-3xl">
                {job.title}
              </h1>

              <p className="mt-2 break-words text-base text-gray-600 dark:text-gray-400">
                {job.company}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="max-w-full break-words rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {formatLabel(job.jobType)}
                </span>

                <span className="max-w-full break-words rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {formatLabel(job.workMode)}
                </span>

                <span className="max-w-full break-words rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                  {formatLabel(job.experienceLevel)}
                </span>
              </div>
            </div>
          </div>

          <div className="my-6 border-t border-gray-200 dark:border-gray-800 sm:my-7" />

          {/* Job information */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
            <InfoItem
              icon={MapPin}
              label="Location"
              value={job.location || "Not specified"}
            />

            <InfoItem
              icon={IndianRupee}
              label="Salary range"
              value={
                job.salaryMin != null || job.salaryMax != null
                  ? `${formatSalary(job.salaryMin) || "Not specified"} – ${
                      formatSalary(job.salaryMax) || "Not specified"
                    }`
                  : "Not specified"
              }
            />

            <InfoItem
              icon={BriefcaseBusiness}
              label="Experience"
              value={formatLabel(job.experienceLevel)}
            />

            <InfoItem
              icon={Users}
              label="Open positions"
              value={job.openings ?? "Not specified"}
            />

            <div className="sm:col-span-2">
              <InfoItem
                icon={CalendarDays}
                label="Posted on"
                value={formatDate(job.createdAt)}
              />
            </div>
          </div>

          <div className="my-6 border-t border-gray-200 dark:border-gray-800 sm:my-7" />

          {/* Description */}
          <section>
            <h2 className="text-xl font-bold">Job Description</h2>

            <p className="mt-4 whitespace-pre-line break-words text-sm leading-7 text-gray-600 dark:text-gray-300 sm:text-base">
              {job.description || "No description provided."}
            </p>
          </section>

          {/* Skills */}
          <section className="mt-8">
            <h2 className="text-xl font-bold">Required Skills</h2>

            {job.skills?.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="max-w-full break-words rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-medium text-violet-700 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-300"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                No specific skills listed.
              </p>
            )}
          </section>

          {/* Apply action */}
          <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-800 sm:mt-9">
            <p className="text-sm leading-6 text-gray-500 dark:text-gray-400">
              Interested in this opportunity? Apply to let the recruiter review
              your profile.
            </p>

            <button
              type="button"
              onClick={() => navigate(`/jobs/${job._id}/apply`)}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-700 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 sm:w-auto"
            >
              Apply for this job
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

function InfoItem({ icon: Icon, label, value }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <Icon
        className="mt-0.5 shrink-0 text-violet-600 dark:text-violet-400"
        size={20}
        aria-hidden="true"
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 break-words font-medium">{value}</p>
      </div>
    </div>
  );
}

