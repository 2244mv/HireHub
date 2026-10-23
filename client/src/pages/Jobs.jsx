import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Search,
  MapPin,
  BriefcaseBusiness,
  SlidersHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import api from "../lib/api";

const initialFilters = {
  search: "",
  location: "",
  jobType: "",
  workMode: "",
  experienceLevel: "",
  sortBy: "latest",
};

const readFiltersFromParams = (params) => ({
  search: params.get("search") || "",
  location: params.get("location") || "",
  jobType: params.get("jobType") || "",
  workMode: params.get("workMode") || "",
  experienceLevel: params.get("experienceLevel") || "",
  sortBy: params.get("sortBy") || "latest",
});

const formatSalary = (amount) => {
  if (amount == null) return null;

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatLabel = (value = "") =>
  value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [filters, setFilters] = useState(() =>
    readFiltersFromParams(searchParams),
  );

  const [page, setPage] = useState(() =>
    Math.max(1, Number(searchParams.get("page")) || 1),
  );

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    limit: 10,
    totalJobs: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Keep filters and page in sync with browser Back/Forward navigation.
  useEffect(() => {
    const nextFilters = readFiltersFromParams(searchParams);
    const nextPage = Math.max(1, Number(searchParams.get("page")) || 1);

    setFilters((current) => {
      const isSame = Object.keys(initialFilters).every(
        (key) => current[key] === nextFilters[key],
      );

      return isSame ? current : nextFilters;
    });

    setPage((current) => (current === nextPage ? current : nextPage));
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();

    const fetchJobs = async () => {
      setLoading(true);

      try {
        const params = {
          ...filters,
          page,
          limit: 10,
        };

        Object.keys(params).forEach((key) => {
          if (params[key] === "") delete params[key];
        });

        const response = await api.get("/jobs", {
          params,
          signal: controller.signal,
        });

        if (controller.signal.aborted) return;

        const data = response.data;
        const jobList = Array.isArray(data.jobs) ? data.jobs : [];

        setJobs(jobList);

        setPagination(
          data.pagination || {
            currentPage: page,
            limit: 10,
            totalJobs: jobList.length,
            totalPages: jobList.length ? 1 : 0,
            hasNextPage: false,
            hasPrevPage: page > 1,
          },
        );
      } catch (error) {
        if (!controller.signal.aborted) {
          toast.error(
            error.response?.data?.message || "Jobs load nahi ho paayi.",
          );

          setJobs([]);

          setPagination({
            currentPage: page,
            limit: 10,
            totalJobs: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          });
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchJobs();

    return () => controller.abort();
  }, [filters, page]);

  const updateFilter = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);

    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ ...initialFilters });
    setPage(1);
    setSearchParams({});
  };

  const changePage = (nextPage) => {
    const safePage = Math.max(1, nextPage);

    setPage(safePage);

    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params[key] = value;
    });

    if (safePage > 1) {
      params.page = String(safePage);
    }

    setSearchParams(params);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-white sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <header className="mb-7">
            <Link
              to="/"
              className="mb-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:hover:bg-gray-800"
            >
              <ArrowLeft size={18} />
              Back to Home
            </Link>

            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-600 dark:text-violet-400">
              Find your next opportunity
            </p>

            <h1 className="text-3xl font-bold sm:text-4xl">Explore Jobs</h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400 sm:text-base">
              Search jobs, compare opportunities and find the right role for
              you.
            </p>
          </header>

          <form
            onSubmit={handleSearch}
            className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:grid-cols-2 lg:grid-cols-3"
          >
            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 px-3 dark:border-gray-700">
              <Search size={18} className="shrink-0 text-gray-400" />
              <input
                value={filters.search}
                onChange={(event) => updateFilter("search", event.target.value)}
                placeholder="Job title, company or skill"
                className="min-w-0 w-full bg-transparent py-3 text-sm outline-none"
              />
            </label>

            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 px-3 dark:border-gray-700">
              <MapPin size={18} className="shrink-0 text-gray-400" />
              <input
                value={filters.location}
                onChange={(event) =>
                  updateFilter("location", event.target.value)
                }
                placeholder="Location"
                className="min-w-0 w-full bg-transparent py-3 text-sm outline-none"
              />
            </label>

            <select
              value={filters.jobType}
              onChange={(event) => updateFilter("jobType", event.target.value)}
              className="min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">All job types</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>

            <select
              value={filters.workMode}
              onChange={(event) => updateFilter("workMode", event.target.value)}
              className="min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">All work modes</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </select>

            <select
              value={filters.experienceLevel}
              onChange={(event) =>
                updateFilter("experienceLevel", event.target.value)
              }
              className="min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm dark:border-gray-700 dark:bg-gray-900"
            >
              <option value="">All experience levels</option>
              <option value="fresher">Fresher</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid level</option>
              <option value="senior">Senior</option>
            </select>

            <label className="flex min-w-0 items-center gap-2 rounded-xl border border-gray-200 px-3 dark:border-gray-700">
              <SlidersHorizontal size={17} className="shrink-0 text-gray-400" />
              <span className="shrink-0 text-sm">Sort</span>

              <select
                value={filters.sortBy}
                onChange={(event) => updateFilter("sortBy", event.target.value)}
                className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none"
              >
                <option value="latest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="salary-high">Highest salary</option>
                <option value="salary-low">Lowest salary</option>
              </select>
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:col-span-3">
              <button
                type="submit"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-700"
              >
                <Search size={17} />
                Search Jobs
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="min-h-11 rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              >
                Clear Filters
              </button>
            </div>
          </form>

          <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Available Opportunities</h2>

            <span className="text-sm text-gray-500 dark:text-gray-400">
              {pagination.totalJobs} jobs found
            </span>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-44 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
                />
              ))}
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-5 py-16 text-center dark:border-gray-700">
              <BriefcaseBusiness
                className="mx-auto mb-4 text-gray-400"
                size={38}
              />

              <h3 className="text-lg font-semibold">No jobs found</h3>

              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Try changing your search or clearing the filters.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 min-h-11 rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {jobs.map((job) => (
                  <article
                    key={job._id}
                    className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 transition hover:shadow-lg dark:border-gray-800 dark:bg-gray-900 sm:p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="break-words text-lg font-bold">
                          {job.title}
                        </h3>

                        <p className="mt-1 break-words text-sm text-gray-600 dark:text-gray-400">
                          {job.company}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                        {formatLabel(job.jobType) || "Job"}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-start gap-1">
                        <MapPin size={15} className="mt-0.5 shrink-0" />
                        <span className="break-words">
                          {job.location || "Location not specified"}
                        </span>
                      </span>

                      {job.workMode && <span>{formatLabel(job.workMode)}</span>}

                      {job.experienceLevel && (
                        <span>{formatLabel(job.experienceLevel)}</span>
                      )}
                    </div>

                    {(job.salaryMin != null || job.salaryMax != null) && (
                      <p className="mt-3 break-words text-sm font-medium text-emerald-600 dark:text-emerald-400">
                        Salary: {formatSalary(job.salaryMin) || "Not specified"}
                        {" – "}
                        {formatSalary(job.salaryMax) || "Not specified"}
                      </p>
                    )}

                    <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-700 sm:w-auto"
                      >
                        View Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  disabled={!pagination.hasPrevPage || loading}
                  onClick={() => changePage(page - 1)}
                  className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700"
                >
                  Previous
                </button>

                <span className="text-center text-sm text-gray-600 dark:text-gray-400">
                  Page {pagination.currentPage} of{" "}
                  {Math.max(1, pagination.totalPages)}
                </span>

                <button
                  type="button"
                  disabled={!pagination.hasNextPage || loading}
                  onClick={() => changePage(page + 1)}
                  className="min-h-11 rounded-lg border border-gray-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700"
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
