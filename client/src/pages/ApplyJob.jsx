import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  LoaderCircle,
  Send,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import api from "../lib/api";

export default function ApplyJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [job, setJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [loadingJob, setLoadingJob] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Authentication and role protection
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/login", {
        replace: true,
        state: { from: `/jobs/${id}/apply` },
      });
      return;
    }

    if (user.role !== "candidate") {
      navigate(
        user.role === "recruiter" ? "/recruiter/dashboard" : "/",
        { replace: true },
      );
    }
  }, [user, authLoading, id, navigate]);

  // Fetch job details
  useEffect(() => {
    let cancelled = false;

    const fetchJob = async () => {
      setLoadingJob(true);
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
          setLoadingJob(false);
        }
      }
    };

    fetchJob();

    return () => {
      cancelled = true;
    };
  }, [id]);

  // Always provide a reliable destination for the Back button
  const handleBackToJob = () => {
    navigate(`/jobs/${id}`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!user || user.role !== "candidate") {
      navigate("/login", {
        state: { from: `/jobs/${id}/apply` },
      });
      return;
    }

    const cleanCoverLetter = coverLetter.trim();

    if (cleanCoverLetter.length < 20) {
      setError("Cover letter kam se kam 20 characters ka hona chahiye.");
      return;
    }

    if (cleanCoverLetter.length > 2000) {
      setError("Cover letter 2000 characters se zyada nahi ho sakta.");
      return;
    }

    setSubmitting(true);

    try {
      await api.post("/applications", {
        jobId: id,
        coverLetter: cleanCoverLetter,
      });

      setSuccess(true);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Application submit nahi ho paayi. Dobara try karo.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Loading screen
  if (authLoading || loadingJob) {
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

  // Redirecting unauthorized users
  if (!user || user.role !== "candidate") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
        <p className="text-center text-gray-600 dark:text-gray-300">
          Redirecting...
        </p>
      </main>
    );
  }

  // Job unavailable or API error
  if (!job) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center dark:bg-gray-950">
        <BriefcaseBusiness
          size={44}
          aria-hidden="true"
          className="mb-4 text-gray-400"
        />

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Job unavailable
        </h1>

        <p className="mt-3 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
          {error || "This job could not be found."}
        </p>

        <div className="mt-6 flex w-full max-w-sm flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/jobs")}
            className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-3 font-semibold text-white transition hover:bg-violet-700"
          >
            <ArrowLeft size={18} />
            Browse Jobs
          </button>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="min-h-11 flex-1 rounded-xl border border-gray-300 px-4 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // Successful application
  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8 dark:bg-gray-950">
        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 text-center dark:border-gray-800 dark:bg-gray-900 sm:p-9">
          <CheckCircle2
            size={56}
            aria-hidden="true"
            className="mx-auto text-green-600"
          />

          <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Application submitted!
          </h1>

          <p className="mt-3 break-words text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
            Your application for <strong>{job.title}</strong> at{" "}
            <strong>{job.company}</strong> has been submitted successfully.
          </p>

          <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate("/candidate/dashboard")}
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700"
            >
              Candidate Dashboard
            </button>

            <Link
              to="/candidate/applications"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-center font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              My Applications
            </Link>

            <Link
              to="/jobs"
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-center font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
            >
              Browse Jobs
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4">
          <button
            type="button"
            onClick={handleBackToJob}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800 sm:px-4"
          >
            <ArrowLeft size={18} />
            Back to Job
          </button>

          <Link
            to="/jobs"
            className="inline-flex min-h-11 items-center justify-center rounded-lg px-3 text-sm font-semibold text-violet-600 hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-950/40"
          >
            All Jobs
          </Link>
        </div>
      </nav>

      <section className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-8">
          {/* Job information */}
          <div className="flex min-w-0 items-start gap-3 sm:gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300 sm:h-12 sm:w-12">
              <BriefcaseBusiness size={24} aria-hidden="true" />
            </div>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold sm:text-2xl">
                Apply for this job
              </h1>

              <p className="mt-2 break-words font-semibold">{job.title}</p>

              <p className="mt-1 break-words text-sm leading-6 text-gray-600 dark:text-gray-400">
                {job.company} · {job.location}
              </p>
            </div>
          </div>

          <div className="my-5 border-t border-gray-200 dark:border-gray-800 sm:my-6" />

          {/* Candidate information */}
          <div className="mb-6 rounded-xl bg-gray-50 p-3 dark:bg-gray-800/60 sm:p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Applying as
            </p>

            <p className="mt-1 break-words font-semibold">{user.name}</p>

            <p className="mt-1 break-all text-sm text-gray-600 dark:text-gray-300">
              {user.email}
            </p>
          </div>

          {/* Application form */}
          <form onSubmit={handleSubmit}>
            <label
              htmlFor="coverLetter"
              className="mb-2 block text-sm font-semibold"
            >
              Cover Letter <span className="text-red-500">*</span>
            </label>

            <p className="mb-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
              Explain briefly why you are suitable for this role and what
              skills you bring to the company.
            </p>

            <textarea
              id="coverLetter"
              name="coverLetter"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Hello, I am interested in this position because..."
              rows={7}
              minLength={20}
              maxLength={2000}
              required
              aria-describedby="coverLetter-help coverLetter-count"
              className="min-h-40 w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-base leading-6 outline-none transition placeholder:text-gray-400 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 dark:border-gray-700 dark:bg-gray-950 dark:placeholder:text-gray-500 sm:p-4"
            />

            <div
              id="coverLetter-help"
              className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-gray-500 dark:text-gray-400"
            >
              <span>Minimum 20 characters · Maximum 2000</span>
              <span id="coverLetter-count" className="tabular-nums">
                {coverLetter.length}/2000
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm leading-6 text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 font-semibold text-white transition hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:focus-visible:ring-offset-gray-900"
            >
              {submitting ? (
                <>
                  <LoaderCircle
                    size={18}
                    aria-hidden="true"
                    className="animate-spin"
                  />
                  Submitting...
                </>
              ) : (
                <>
                  <Send size={18} aria-hidden="true" />
                  Submit Application
                </>
              )}
            </button>

            <p className="mt-3 text-center text-xs leading-5 text-gray-500 dark:text-gray-400">
              Please review your cover letter before submitting.
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}

