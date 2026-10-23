import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Users,
  FileText,
  Plus,
  RefreshCw,
  Trash2,
  Eye,
  ExternalLink,
  Pencil,
  Save,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";
import Navbar from "../components/Navbar";

const statusOptions = [
  "pending",
  "reviewed",
  "shortlisted",
  "rejected",
  "hired",
];

const statusStyles = {
  pending: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  reviewed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  shortlisted:
    "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300",
  rejected: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  hired:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
};

const jobTypeOptions = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "internship", label: "Internship" },
  { value: "contract", label: "Contract" },
];

const workModeOptions = [
  { value: "onsite", label: "On-site" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

const experienceOptions = [
  { value: "fresher", label: "Fresher" },
  { value: "junior", label: "Junior" },
  { value: "mid", label: "Mid-level" },
  { value: "senior", label: "Senior" },
];

const emptyJobForm = {
  title: "",
  company: "",
  description: "",
  location: "",
  jobType: "full-time",
  workMode: "onsite",
  experienceLevel: "fresher",
  salaryMin: "",
  salaryMax: "",
  skills: "",
  openings: "1",
};

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950";

const formatLabel = (value = "") =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const formatSalary = (amount) => {
  if (amount == null || amount === "") return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>

        <Icon
          size={21}
          className="shrink-0 text-indigo-600 dark:text-indigo-400"
        />
      </div>

      <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  required = false,
  type = "text",
  min,
  max,
  step,
}) {
  return (
    <label className="block min-w-0 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}

      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        min={min}
        max={max}
        step={step}
        className={`${inputClass} mt-1.5`}
      />
    </label>
  );
}

function FormSelect({ label, name, value, onChange, options }) {
  return (
    <label className="block min-w-0 text-sm font-medium text-slate-700 dark:text-slate-300">
      {label}

      <select
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`${inputClass} mt-1.5`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function RecruiterDashboard() {
  const [jobs, setJobs] = useState([]);

  const [stats, setStats] = useState({
    jobsPosted: 0,
    applicationsReceived: 0,
    candidates: 0,
  });

  const [applications, setApplications] = useState({});
  const [expandedJob, setExpandedJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingApplicants, setLoadingApplicants] = useState(null);
  const [updatingApplication, setUpdatingApplication] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [error, setError] = useState("");

  const [editingJobId, setEditingJobId] = useState(null);
  const [editForm, setEditForm] = useState(emptyJobForm);
  const [savingJob, setSavingJob] = useState(false);

  const fetchDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    setError("");

    try {
      const response = await api.get("/jobs/my");
      const data = response.data;
      const jobList = Array.isArray(data.jobs) ? data.jobs : [];

      setJobs(jobList);

      setStats(
        data.stats || {
          jobsPosted: jobList.length,
          applicationsReceived: 0,
          candidates: 0,
        },
      );
    } catch (err) {
      const message =
        err.response?.data?.message || "Dashboard load nahi ho saka.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const startEditing = (job) => {
    setEditingJobId(job._id);

    setEditForm({
      title: job.title || "",
      company: job.company || "",
      description: job.description || "",
      location: job.location || "",
      jobType: job.jobType || "full-time",
      workMode: job.workMode || "onsite",
      experienceLevel: job.experienceLevel || "fresher",
      salaryMin: job.salaryMin ?? "",
      salaryMax: job.salaryMax ?? "",
      skills: Array.isArray(job.skills)
        ? job.skills.join(", ")
        : job.skills || "",
      openings: String(job.openings ?? 1),
    });
  };

  const cancelEditing = () => {
    setEditingJobId(null);
    setEditForm({ ...emptyJobForm });
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const saveJob = async (event, jobId) => {
    event.preventDefault();

    if (savingJob) return;

    if (
      !editForm.title.trim() ||
      !editForm.company.trim() ||
      !editForm.description.trim() ||
      !editForm.location.trim()
    ) {
      toast.error("Title, company, description aur location required hain.");
      return;
    }

    if (
      editForm.title.trim().length < 2 ||
      editForm.title.trim().length > 100
    ) {
      toast.error("Job title 2 se 100 characters ke beech hona chahiye.");
      return;
    }

    if (editForm.company.trim().length > 100) {
      toast.error("Company name maximum 100 characters ka ho sakta hai.");
      return;
    }

    if (editForm.description.trim().length < 20) {
      toast.error("Job description kam se kam 20 characters ki honi chahiye.");
      return;
    }

    if (!jobTypeOptions.some((option) => option.value === editForm.jobType)) {
      toast.error("Please select a valid job type.");
      return;
    }

    if (!workModeOptions.some((option) => option.value === editForm.workMode)) {
      toast.error("Please select a valid work mode.");
      return;
    }

    if (
      !experienceOptions.some(
        (option) => option.value === editForm.experienceLevel,
      )
    ) {
      toast.error("Please select a valid experience level.");
      return;
    }

    const salaryMin =
      editForm.salaryMin === "" ? null : Number(editForm.salaryMin);

    const salaryMax =
      editForm.salaryMax === "" ? null : Number(editForm.salaryMax);

    const openings = Number(editForm.openings);

    if (
      (salaryMin !== null && (!Number.isFinite(salaryMin) || salaryMin < 0)) ||
      (salaryMax !== null && (!Number.isFinite(salaryMax) || salaryMax < 0))
    ) {
      toast.error("Salary valid non-negative number honi chahiye.");
      return;
    }

    if (salaryMin !== null && salaryMax !== null && salaryMin > salaryMax) {
      toast.error("Minimum salary maximum salary se zyada nahi ho sakti.");
      return;
    }

    if (!Number.isInteger(openings) || openings < 1) {
      toast.error("Openings kam se kam 1 honi chahiye.");
      return;
    }

    const payload = {
      title: editForm.title.trim(),
      company: editForm.company.trim(),
      description: editForm.description.trim(),
      location: editForm.location.trim(),
      jobType: editForm.jobType,
      workMode: editForm.workMode,
      experienceLevel: editForm.experienceLevel,
      salaryMin,
      salaryMax,
      skills: editForm.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      openings,
    };

    setSavingJob(true);

    try {
      await api.patch(`/jobs/${jobId}`, payload);

      toast.success("Job successfully updated.");
      cancelEditing();
      await fetchDashboard(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Job update nahi ho saki.");
    } finally {
      setSavingJob(false);
    }
  };

  const fetchApplicants = async (jobId) => {
    if (loadingApplicants === jobId) return;

    if (expandedJob === jobId) {
      setExpandedJob(null);
      return;
    }

    setExpandedJob(jobId);
    setLoadingApplicants(jobId);

    try {
      const response = await api.get(`/applications/job/${jobId}`);
      const data = response.data;

      setApplications((previous) => ({
        ...previous,
        [jobId]: Array.isArray(data.applications) ? data.applications : [],
      }));
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Applicants load nahi ho sake.",
      );

      setApplications((previous) => ({
        ...previous,
        [jobId]: [],
      }));
    } finally {
      setLoadingApplicants(null);
    }
  };

  const updateApplicationStatus = async (applicationId, jobId, status) => {
    if (updatingApplication === applicationId) return;

    setUpdatingApplication(applicationId);

    try {
      const response = await api.patch(
        `/applications/${applicationId}/status`,
        { status },
      );

      const updatedApplication =
        response.data.application || response.data.data;

      setApplications((previous) => ({
        ...previous,
        [jobId]: (previous[jobId] || []).map((application) =>
          (application._id || application.id) === applicationId
            ? {
                ...application,
                ...(updatedApplication || {}),
                status,
              }
            : application,
        ),
      }));

      toast.success(`Application status updated to ${status}.`);
      await fetchDashboard(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Status update nahi ho saka.");
    } finally {
      setUpdatingApplication(null);
    }
  };

  const deleteJob = async (job) => {
    if (deletingJob === job._id) return;

    const confirmed = window.confirm(
      `Kya tum "${job.title}" job delete karna chahte ho? Is job ki applications bhi delete ho jayengi.`,
    );

    if (!confirmed) return;

    setDeletingJob(job._id);

    try {
      await api.delete(`/jobs/${job._id}`);

      setJobs((previous) => previous.filter((item) => item._id !== job._id));

      setApplications((previous) => {
        const updated = { ...previous };
        delete updated[job._id];
        return updated;
      });

      if (expandedJob === job._id) {
        setExpandedJob(null);
      }

      if (editingJobId === job._id) {
        cancelEditing();
      }

      toast.success("Job successfully deleted.");
      await fetchDashboard(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Job delete nahi hui.");
    } finally {
      setDeletingJob(null);
    }
  };

  // Navbar loading screen par bhi visible rahegi.
  if (loading) {
    return (
      <>
        <Navbar />

        <main className="flex min-h-[60vh] items-center justify-center bg-slate-50 px-4 text-slate-600 dark:bg-slate-950 dark:text-slate-300">
          <div className="text-center">
            <RefreshCw className="mx-auto mb-3 animate-spin" size={28} />
            <p>Dashboard loading...</p>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Recruiter dashboard ki main navbar */}
      <Navbar />

      <main className="min-h-screen bg-slate-50 px-4 py-6 dark:bg-slate-950 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Link
            to="/"
            className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>

          <header className="mb-8 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div className="min-w-0">
              <p className="mb-2 text-sm font-semibold tracking-wider text-indigo-600 dark:text-indigo-400">
                RECRUITER PANEL
              </p>

              <h1 className="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
                Recruiter Dashboard
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 sm:text-base">
                Manage your jobs and review candidate applications.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => fetchDashboard(false)}
                disabled={refreshing}
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
              >
                <RefreshCw
                  size={17}
                  className={refreshing ? "animate-spin" : ""}
                />
                {refreshing ? "Refreshing..." : "Refresh"}
              </button>

              <Link
                to="/recruiter/jobs/new"
                className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                <Plus size={18} />
                Post a Job
              </Link>
            </div>
          </header>

          {error && (
            <div
              role="alert"
              className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
            >
              <p>{error}</p>

              <button
                type="button"
                onClick={() => fetchDashboard()}
                className="shrink-0 font-semibold underline"
              >
                Try again
              </button>
            </div>
          )}

          <section
            aria-label="Recruiter statistics"
            className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <StatCard
              title="Jobs Posted"
              value={stats.jobsPosted}
              icon={BriefcaseBusiness}
            />

            <StatCard
              title="Applications Received"
              value={stats.applicationsReceived}
              icon={FileText}
            />

            <StatCard
              title="Unique Candidates"
              value={stats.candidates}
              icon={Users}
            />
          </section>

          <section>
            <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
              Your Job Listings
            </h2>

            {jobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900 sm:p-12">
                <BriefcaseBusiness
                  size={38}
                  className="mx-auto mb-3 text-slate-400"
                />

                <h3 className="font-semibold text-slate-900 dark:text-white">
                  No jobs posted yet
                </h3>

                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Post your first job to start receiving applications.
                </p>

                <Link
                  to="/recruiter/jobs/new"
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700"
                >
                  <Plus size={18} />
                  Post a Job
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {jobs.map((job) => (
                  <article
                    key={job._id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
                  >
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-start">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="break-words text-lg font-bold text-slate-900 dark:text-white">
                              {job.title}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                job.status === "closed"
                                  ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
                                  : "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                              }`}
                            >
                              {formatLabel(job.status || "active")}
                            </span>
                          </div>

                          <p className="mt-2 break-words text-sm text-slate-500 dark:text-slate-400">
                            {job.company} · {job.location}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-slate-600 dark:text-slate-300">
                            <span>
                              <FileText size={15} className="mr-1 inline" />
                              {job.applicationsCount ?? 0} applications
                            </span>

                            <span>
                              <Users size={15} className="mr-1 inline" />
                              {job.candidatesCount ?? 0} candidates
                            </span>

                            {job.jobType && (
                              <span>{formatLabel(job.jobType)}</span>
                            )}

                            {job.workMode && (
                              <span>{formatLabel(job.workMode)}</span>
                            )}
                          </div>

                          {(job.salaryMin != null || job.salaryMax != null) && (
                            <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                              {formatSalary(job.salaryMin) || "Not specified"}
                              {" – "}
                              {formatSalary(job.salaryMax) || "Not specified"}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:max-w-[440px]">
                          <button
                            type="button"
                            onClick={() =>
                              editingJobId === job._id
                                ? cancelEditing()
                                : startEditing(job)
                            }
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-indigo-200 px-3 py-2.5 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-900 dark:hover:bg-indigo-950"
                          >
                            {editingJobId === job._id ? (
                              <>
                                <X size={16} />
                                Cancel Edit
                              </>
                            ) : (
                              <>
                                <Pencil size={16} />
                                Edit Job
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => fetchApplicants(job._id)}
                            disabled={loadingApplicants === job._id}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
                          >
                            <Eye size={16} />
                            {loadingApplicants === job._id
                              ? "Loading..."
                              : expandedJob === job._id
                                ? "Hide Applicants"
                                : "View Applicants"}
                          </button>

                          <button
                            type="button"
                            onClick={() => deleteJob(job)}
                            disabled={deletingJob === job._id}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50 sm:col-span-2 dark:border-red-900 dark:hover:bg-red-950"
                          >
                            <Trash2 size={16} />
                            {deletingJob === job._id
                              ? "Deleting..."
                              : "Delete Job"}
                          </button>
                        </div>
                      </div>
                    </div>

                    {editingJobId === job._id && (
                      <form
                        onSubmit={(event) => saveJob(event, job._id)}
                        className="border-t border-slate-200 bg-indigo-50/50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6"
                      >
                        <h4 className="mb-5 text-lg font-bold text-slate-900 dark:text-white">
                          Edit Job Details
                        </h4>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          <FormField
                            label="Job Title"
                            name="title"
                            value={editForm.title}
                            onChange={handleEditChange}
                            required
                          />

                          <FormField
                            label="Company"
                            name="company"
                            value={editForm.company}
                            onChange={handleEditChange}
                            required
                          />

                          <FormField
                            label="Location"
                            name="location"
                            value={editForm.location}
                            onChange={handleEditChange}
                            required
                          />

                          <FormSelect
                            label="Job Type"
                            name="jobType"
                            value={editForm.jobType}
                            onChange={handleEditChange}
                            options={jobTypeOptions}
                          />

                          <FormSelect
                            label="Work Mode"
                            name="workMode"
                            value={editForm.workMode}
                            onChange={handleEditChange}
                            options={workModeOptions}
                          />

                          <FormSelect
                            label="Experience Level"
                            name="experienceLevel"
                            value={editForm.experienceLevel}
                            onChange={handleEditChange}
                            options={experienceOptions}
                          />

                          <FormField
                            label="Minimum Salary (INR)"
                            name="salaryMin"
                            type="number"
                            min="0"
                            step="1"
                            value={editForm.salaryMin}
                            onChange={handleEditChange}
                          />

                          <FormField
                            label="Maximum Salary (INR)"
                            name="salaryMax"
                            type="number"
                            min="0"
                            step="1"
                            value={editForm.salaryMax}
                            onChange={handleEditChange}
                          />

                          <FormField
                            label="Number of Openings"
                            name="openings"
                            type="number"
                            min="1"
                            step="1"
                            value={editForm.openings}
                            onChange={handleEditChange}
                            required
                          />

                          <label className="block text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3 dark:text-slate-300">
                            Skills (comma-separated)
                            <input
                              name="skills"
                              value={editForm.skills}
                              onChange={handleEditChange}
                              placeholder="React, Node.js, MongoDB"
                              className={`${inputClass} mt-1.5`}
                            />
                          </label>

                          <label className="block text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-3 dark:text-slate-300">
                            Job Description
                            <textarea
                              name="description"
                              value={editForm.description}
                              onChange={handleEditChange}
                              required
                              minLength={20}
                              rows={5}
                              className={`${inputClass} mt-1.5 resize-y`}
                            />
                          </label>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                          <button
                            type="submit"
                            disabled={savingJob}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Save size={17} />
                            {savingJob ? "Saving..." : "Save Changes"}
                          </button>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            disabled={savingJob}
                            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 dark:border-slate-700 dark:text-white"
                          >
                            <X size={17} />
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}

                    {expandedJob === job._id && (
                      <div className="border-t border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 sm:p-6">
                        <h4 className="mb-4 break-words font-bold text-slate-900 dark:text-white">
                          Applicants for {job.title}
                        </h4>

                        {loadingApplicants === job._id ? (
                          <p className="text-sm text-slate-500">
                            Loading applicants...
                          </p>
                        ) : (applications[job._id] || []).length === 0 ? (
                          <p className="rounded-xl bg-white p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
                            No applications found for this job.
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {(applications[job._id] || []).map(
                              (application) => {
                                const candidate =
                                  application.candidate &&
                                  typeof application.candidate === "object"
                                    ? application.candidate
                                    : {};

                                const applicationId =
                                  application._id || application.id;

                                return (
                                  <div
                                    key={applicationId}
                                    className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                                  >
                                    <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
                                      <div className="min-w-0">
                                        <h5 className="break-words font-semibold text-slate-900 dark:text-white">
                                          {candidate.name ||
                                            "Candidate name unavailable"}
                                        </h5>

                                        <p className="mt-1 break-all text-sm text-slate-500 dark:text-slate-400">
                                          {candidate.email ||
                                            "Email unavailable"}
                                        </p>

                                        {candidate.headline && (
                                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                                            {candidate.headline}
                                          </p>
                                        )}

                                        <div className="mt-3 flex flex-wrap items-center gap-3">
                                          <span
                                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                              statusStyles[
                                                application.status
                                              ] || statusStyles.pending
                                            }`}
                                          >
                                            {formatLabel(
                                              application.status || "pending",
                                            )}
                                          </span>

                                          {(application.resumeUrl ||
                                            candidate.resumeUrl) && (
                                            <a
                                              href={
                                                application.resumeUrl ||
                                                candidate.resumeUrl
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex min-h-9 items-center gap-1 text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                                            >
                                              View Resume
                                              <ExternalLink size={14} />
                                            </a>
                                          )}

                                          {candidate.linkedinUrl && (
                                            <a
                                              href={candidate.linkedinUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-sm font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                                            >
                                              LinkedIn
                                            </a>
                                          )}
                                        </div>

                                        {application.coverLetter && (
                                          <details className="mt-3">
                                            <summary className="cursor-pointer text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                                              View Cover Letter
                                            </summary>

                                            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
                                              {application.coverLetter}
                                            </p>
                                          </details>
                                        )}
                                      </div>

                                      <label className="block w-full shrink-0 text-sm font-medium text-slate-600 dark:text-slate-300 xl:w-48">
                                        Application Status
                                        <select
                                          value={
                                            application.status || "pending"
                                          }
                                          disabled={
                                            updatingApplication ===
                                            applicationId
                                          }
                                          onChange={(event) =>
                                            updateApplicationStatus(
                                              applicationId,
                                              job._id,
                                              event.target.value,
                                            )
                                          }
                                          className={`${inputClass} mt-1.5`}
                                        >
                                          {statusOptions.map((status) => (
                                            <option key={status} value={status}>
                                              {formatLabel(status)}
                                            </option>
                                          ))}
                                        </select>
                                        {updatingApplication ===
                                          applicationId && (
                                          <span className="mt-1 block text-xs text-indigo-600">
                                            Updating...
                                          </span>
                                        )}
                                      </label>
                                    </div>
                                  </div>
                                );
                              },
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
