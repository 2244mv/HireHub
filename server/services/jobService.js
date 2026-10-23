import mongoose from "mongoose";
import Job from "../models/Job.js";
import Application from "../models/Application.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

// Escape special characters in search input.
const escapeRegex = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Validate MongoDB document ID.
const validateJobId = (jobId) => {
  if (!mongoose.Types.ObjectId.isValid(jobId)) {
    throw createError("Invalid job ID", 400);
  }
};

// Create a job.
export const createJob = async (jobData, userId) => {
  if (!jobData || typeof jobData !== "object" || Array.isArray(jobData)) {
    throw createError("Invalid job data", 400);
  }

  const {
    title,
    company,
    description,
    location,
    jobType,
    workMode,
    experienceLevel,
    salaryMin,
    salaryMax,
    skills,
    openings,
  } = jobData;

  if (
    salaryMin != null &&
    salaryMin !== "" &&
    salaryMax != null &&
    salaryMax !== "" &&
    Number(salaryMin) > Number(salaryMax)
  ) {
    throw createError("Minimum salary cannot exceed maximum salary", 400);
  }

  return Job.create({
    title,
    company,
    description,
    location,
    jobType,
    workMode,
    experienceLevel,
    salaryMin,
    salaryMax,
    skills,
    openings,
    createdBy: userId,
  });
};

// Search, filter, sort and paginate active jobs.
export const getJobs = async (queryParams = {}) => {
  const {
    page = "1",
    limit = "10",
    search = "",
    location = "",
    jobType,
    workMode,
    experienceLevel,
    sortBy = "latest",
  } = queryParams;

  const currentPage = Math.max(1, Number.parseInt(page, 10) || 1);

  const pageSize = Math.min(50, Math.max(1, Number.parseInt(limit, 10) || 10));

  const filter = { status: "active" };
  const searchText = String(search).trim();

  if (searchText) {
    const regex = new RegExp(escapeRegex(searchText), "i");

    filter.$or = [
      { title: regex },
      { company: regex },
      { description: regex },
      { skills: regex },
    ];
  }

  const locationText = String(location).trim();

  if (locationText) {
    filter.location = {
      $regex: escapeRegex(locationText),
      $options: "i",
    };
  }

  const allowedJobTypes = ["full-time", "part-time", "internship", "contract"];

  const allowedWorkModes = ["onsite", "remote", "hybrid"];

  const allowedExperienceLevels = ["fresher", "junior", "mid", "senior"];

  if (jobType && allowedJobTypes.includes(jobType)) {
    filter.jobType = jobType;
  }

  if (workMode && allowedWorkModes.includes(workMode)) {
    filter.workMode = workMode;
  }

  if (experienceLevel && allowedExperienceLevels.includes(experienceLevel)) {
    filter.experienceLevel = experienceLevel;
  }

  const sortOptions = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "salary-low": { salaryMin: 1, createdAt: -1 },
    "salary-high": { salaryMax: -1, createdAt: -1 },
  };

  const sort = sortOptions[sortBy] || sortOptions.latest;
  const skip = (currentPage - 1) * pageSize;

  const [jobs, totalJobs] = await Promise.all([
    Job.find(filter)
      .populate("createdBy", "name")
      .sort(sort)
      .skip(skip)
      .limit(pageSize)
      .lean(),

    Job.countDocuments(filter),
  ]);

  return {
    jobs,
    pagination: {
      currentPage,
      limit: pageSize,
      totalJobs,
      totalPages: Math.ceil(totalJobs / pageSize),
      hasNextPage: currentPage * pageSize < totalJobs,
      hasPrevPage: currentPage > 1,
    },
  };
};

// Get one active job by ID.
export const getJobById = async (jobId) => {
  validateJobId(jobId);

  const job = await Job.findOne({
    _id: jobId,
    status: "active",
  })
    .populate("createdBy", "name")
    .lean();

  if (!job) {
    throw createError("Job not found", 404);
  }

  return job;
};

// Get recruiter dashboard data.
export const getRecruiterDashboard = async (userId) => {
  const jobs = await Job.find({ createdBy: userId })
    .sort({ createdAt: -1 })
    .lean();

  const jobIds = jobs.map((job) => job._id);

  const applicationStats = jobIds.length
    ? await Application.aggregate([
        {
          $match: {
            job: { $in: jobIds },
          },
        },
        {
          $group: {
            _id: "$job",
            totalApplications: { $sum: 1 },
            candidates: { $addToSet: "$candidate" },
          },
        },
      ])
    : [];

  const statsMap = new Map(
    applicationStats.map((item) => [
      item._id.toString(),
      {
        applicationsCount: item.totalApplications,
        candidatesCount: item.candidates.length,
      },
    ]),
  );

  const jobsWithStats = jobs.map((job) => ({
    ...job,
    ...(statsMap.get(job._id.toString()) || {
      applicationsCount: 0,
      candidatesCount: 0,
    }),
  }));

  const totalApplications = jobsWithStats.reduce(
    (total, job) => total + job.applicationsCount,
    0,
  );

  const uniqueCandidates = new Set(
    applicationStats.flatMap((item) =>
      item.candidates.map((candidateId) => candidateId.toString()),
    ),
  );

  return {
    stats: {
      jobsPosted: jobs.length,
      applicationsReceived: totalApplications,
      candidates: uniqueCandidates.size,
    },
    jobs: jobsWithStats,
  };
};

// Update a job owned by the logged-in recruiter.
export const updateRecruiterJob = async (jobId, jobData, recruiterId) => {
  validateJobId(jobId);

  if (!jobData || typeof jobData !== "object" || Array.isArray(jobData)) {
    throw createError("Invalid job data", 400);
  }

  const job = await Job.findOne({
    _id: jobId,
    createdBy: recruiterId,
  });

  if (!job) {
    throw createError("Job not found or you cannot edit this job", 404);
  }

  const allowedFields = [
    "title",
    "company",
    "description",
    "location",
    "jobType",
    "workMode",
    "experienceLevel",
    "salaryMin",
    "salaryMax",
    "skills",
    "openings",
  ];

  const updates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(jobData, field)) {
      updates[field] = jobData[field];
    }
  }

  if (Object.keys(updates).length === 0) {
    throw createError("Provide at least one valid field to update", 400);
  }

  const minSalary =
    updates.salaryMin !== undefined ? updates.salaryMin : job.salaryMin;

  const maxSalary =
    updates.salaryMax !== undefined ? updates.salaryMax : job.salaryMax;

  if (
    minSalary != null &&
    minSalary !== "" &&
    maxSalary != null &&
    maxSalary !== "" &&
    Number(minSalary) > Number(maxSalary)
  ) {
    throw createError("Minimum salary cannot exceed maximum salary", 400);
  }

  for (const [field, value] of Object.entries(updates)) {
    job.set(field, value);
  }

  await job.save();

  return job;
};

// Delete a job owned by the logged-in recruiter.
export const deleteRecruiterJob = async (jobId, recruiterId) => {
  validateJobId(jobId);

  const job = await Job.findOne({
    _id: jobId,
    createdBy: recruiterId,
  });

  if (!job) {
    throw createError("Job not found or you cannot delete this job", 404);
  }

  await Application.deleteMany({ job: job._id });
  await job.deleteOne();

  return {
    message: "Job and its applications deleted successfully",
  };
};
