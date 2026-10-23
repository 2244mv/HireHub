import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../lib/api";

const initialForm = {
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

const inputClass =
  "mt-2 w-full min-w-0 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:ring-indigo-950";

const labelClass =
  "block text-sm font-semibold text-slate-700 dark:text-slate-200";

const errorClass = "mt-1.5 text-sm text-red-600 dark:text-red-400";

function PostJob() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ ...initialForm });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const validateForm = () => {
    const nextErrors = {};

    const title = form.title.trim();
    const company = form.company.trim();
    const description = form.description.trim();
    const location = form.location.trim();

    if (title.length < 2 || title.length > 100) {
      nextErrors.title = "Job title must contain 2–100 characters.";
    }

    if (company.length < 2 || company.length > 100) {
      nextErrors.company = "Company name must contain 2–100 characters.";
    }

    if (description.length < 20) {
      nextErrors.description =
        "Description must contain at least 20 characters.";
    }

    if (!location) {
      nextErrors.location = "Job location is required.";
    }

    if (!jobTypeOptions.some((option) => option.value === form.jobType)) {
      nextErrors.jobType = "Please select a valid job type.";
    }

    if (!workModeOptions.some((option) => option.value === form.workMode)) {
      nextErrors.workMode = "Please select a valid work mode.";
    }

    if (
      !experienceOptions.some(
        (option) => option.value === form.experienceLevel,
      )
    ) {
      nextErrors.experienceLevel =
        "Please select a valid experience level.";
    }

    if (
      form.salaryMin !== "" &&
      (!Number.isFinite(Number(form.salaryMin)) ||
        Number(form.salaryMin) < 0)
    ) {
      nextErrors.salaryMin = "Enter a valid non-negative minimum salary.";
    }

    if (
      form.salaryMax !== "" &&
      (!Number.isFinite(Number(form.salaryMax)) ||
        Number(form.salaryMax) < 0)
    ) {
      nextErrors.salaryMax = "Enter a valid non-negative maximum salary.";
    }

    if (
      form.salaryMin !== "" &&
      form.salaryMax !== "" &&
      Number(form.salaryMin) > Number(form.salaryMax)
    ) {
      nextErrors.salaryMax =
        "Maximum salary must be greater than or equal to minimum salary.";
    }

    const openings = Number(form.openings);

    if (
      form.openings.trim() === "" ||
      !Number.isInteger(openings) ||
      openings < 1
    ) {
      nextErrors.openings = "At least 1 opening is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (submitting) return;

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      description: form.description.trim(),
      location: form.location.trim(),
      jobType: form.jobType,
      workMode: form.workMode,
      experienceLevel: form.experienceLevel,
      salaryMin: form.salaryMin === "" ? null : Number(form.salaryMin),
      salaryMax: form.salaryMax === "" ? null : Number(form.salaryMax),
      skills: [
        ...new Set(
          form.skills
            .split(",")
            .map((skill) => skill.trim())
            .filter(Boolean),
        ),
      ],
      openings: Number(form.openings),
    };

    setSubmitting(true);

    try {
      await api.post("/jobs", payload);

      toast.success("Job posted successfully!");
      setForm({ ...initialForm });
      setErrors({});

      navigate("/recruiter/dashboard", { replace: true });
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to post the job. Please try again.";

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Navbar />

      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <Link
          to="/recruiter/dashboard"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-semibold text-slate-600 transition hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={18} />
          Back to Recruiter Dashboard
        </Link>

        <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:rounded-3xl sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="shrink-0 rounded-2xl bg-indigo-100 p-3 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              <BriefcaseBusiness size={25} />
            </div>

            <div className="min-w-0">
              <h1 className="text-2xl font-bold sm:text-3xl">
                Post a New Job
              </h1>

              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Share the role details to find the right candidate for your
                team.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-7 space-y-6 sm:mt-8"
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="title" className={labelClass}>
                  Job Title *
                </label>

                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. MERN Stack Developer"
                  className={inputClass}
                  required
                  minLength={2}
                  maxLength={100}
                  aria-invalid={Boolean(errors.title)}
                />

                {errors.title && (
                  <p className={errorClass}>{errors.title}</p>
                )}
              </div>

              <div>
                <label htmlFor="company" className={labelClass}>
                  Company Name *
                </label>

                <input
                  id="company"
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="e.g. HireHub Technologies"
                  className={inputClass}
                  required
                  minLength={2}
                  maxLength={100}
                  aria-invalid={Boolean(errors.company)}
                />

                {errors.company && (
                  <p className={errorClass}>{errors.company}</p>
                )}
              </div>

              <div>
                <label htmlFor="location" className={labelClass}>
                  Job Location *
                </label>

                <input
                  id="location"
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="e.g. Delhi, India"
                  className={inputClass}
                  required
                  aria-invalid={Boolean(errors.location)}
                />

                {errors.location && (
                  <p className={errorClass}>{errors.location}</p>
                )}
              </div>

              <div>
                <label htmlFor="jobType" className={labelClass}>
                  Job Type *
                </label>

                <select
                  id="jobType"
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  {jobTypeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {errors.jobType && (
                  <p className={errorClass}>{errors.jobType}</p>
                )}
              </div>

              <div>
                <label htmlFor="workMode" className={labelClass}>
                  Work Mode *
                </label>

                <select
                  id="workMode"
                  name="workMode"
                  value={form.workMode}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  {workModeOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {errors.workMode && (
                  <p className={errorClass}>{errors.workMode}</p>
                )}
              </div>

              <div>
                <label htmlFor="experienceLevel" className={labelClass}>
                  Experience Level *
                </label>

                <select
                  id="experienceLevel"
                  name="experienceLevel"
                  value={form.experienceLevel}
                  onChange={handleChange}
                  className={inputClass}
                  required
                >
                  {experienceOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                {errors.experienceLevel && (
                  <p className={errorClass}>{errors.experienceLevel}</p>
                )}
              </div>

              <div>
                <label htmlFor="salaryMin" className={labelClass}>
                  Minimum Salary (₹ per year)
                </label>

                <input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  min="0"
                  step="1"
                  value={form.salaryMin}
                  onChange={handleChange}
                  placeholder="e.g. 300000"
                  className={inputClass}
                  aria-invalid={Boolean(errors.salaryMin)}
                />

                {errors.salaryMin && (
                  <p className={errorClass}>{errors.salaryMin}</p>
                )}
              </div>

              <div>
                <label htmlFor="salaryMax" className={labelClass}>
                  Maximum Salary (₹ per year)
                </label>

                <input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  min="0"
                  step="1"
                  value={form.salaryMax}
                  onChange={handleChange}
                  placeholder="e.g. 500000"
                  className={inputClass}
                  aria-invalid={Boolean(errors.salaryMax)}
                />

                {errors.salaryMax && (
                  <p className={errorClass}>{errors.salaryMax}</p>
                )}
              </div>

              <div>
                <label htmlFor="openings" className={labelClass}>
                  Number of Openings *
                </label>

                <input
                  id="openings"
                  name="openings"
                  type="number"
                  min="1"
                  step="1"
                  value={form.openings}
                  onChange={handleChange}
                  className={inputClass}
                  required
                  aria-invalid={Boolean(errors.openings)}
                />

                {errors.openings && (
                  <p className={errorClass}>{errors.openings}</p>
                )}
              </div>

              <div>
                <label htmlFor="skills" className={labelClass}>
                  Required Skills
                </label>

                <input
                  id="skills"
                  name="skills"
                  value={form.skills}
                  onChange={handleChange}
                  placeholder="React.js, Node.js, MongoDB"
                  className={inputClass}
                />

                <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                  Separate skills with commas.
                </p>
              </div>
            </div>

            <div>
              <label htmlFor="description" className={labelClass}>
                Job Description *
              </label>

              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
                className={inputClass}
                required
                minLength={20}
                aria-invalid={Boolean(errors.description)}
              />

              {errors.description && (
                <p className={errorClass}>{errors.description}</p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-6 sm:flex-row sm:justify-end dark:border-slate-800">
              <Link
                to="/recruiter/dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && (
                  <LoaderCircle size={18} className="animate-spin" />
                )}

                {submitting ? "Posting Job..." : "Publish Job"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default PostJob;

