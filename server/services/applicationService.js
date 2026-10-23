import mongoose from "mongoose";
import Application from "../models/Application.js";
import Job from "../models/Job.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const isValidUrl = (value) => {
  if (!value) return true;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

// Candidate applies for a job.
export const applyForJob = async (candidateId, data = {}) => {
  const { jobId, coverLetter = "", resumeUrl = "" } = data;

  if (!mongoose.isValidObjectId(jobId)) {
    throw createError("Invalid job ID", 400);
  }

  if (typeof coverLetter !== "string" || typeof resumeUrl !== "string") {
    throw createError("Cover letter and resume URL must be text", 400);
  }

  const cleanCoverLetter = coverLetter.trim();
  const cleanResumeUrl = resumeUrl.trim();

  if (cleanCoverLetter.length > 2000) {
    throw createError("Cover letter is too long", 400);
  }

  if (!isValidUrl(cleanResumeUrl)) {
    throw createError("Resume URL must be a valid HTTP or HTTPS URL", 400);
  }

  const job = await Job.findOne({
    _id: jobId,
    status: "active",
  });

  if (!job) {
    throw createError("Job not found or no longer active", 404);
  }

  const existingApplication = await Application.findOne({
    job: jobId,
    candidate: candidateId,
  });

  if (existingApplication) {
    throw createError("You have already applied for this job", 409);
  }

  try {
    return await Application.create({
      job: jobId,
      candidate: candidateId,
      coverLetter: cleanCoverLetter,
      resumeUrl: cleanResumeUrl,
    });
  } catch (error) {
    // The unique compound index also blocks concurrent duplicates.
    if (error.code === 11000) {
      throw createError("You have already applied for this job", 409);
    }

    if (error.name === "ValidationError") {
      throw createError(error.message, 400);
    }

    throw error;
  }
};

// Candidate views only their own applications.
export const getMyApplications = async (candidateId) => {
  return Application.find({ candidate: candidateId })
    .populate("job")
    .sort({ createdAt: -1 })
    .lean();
};

// Recruiter views applicants for their own job.
export const getApplicantsForJob = async (recruiterId, jobId) => {
  if (!mongoose.isValidObjectId(jobId)) {
    throw createError("Invalid job ID", 400);
  }

  const job = await Job.findOne({
    _id: jobId,
    createdBy: recruiterId,
  });

  if (!job) {
    throw createError("Job not found or you do not own this job", 404);
  }

  return Application.find({ job: jobId })
    .populate(
      "candidate",
      "name email headline skills experienceLevel resumeUrl linkedinUrl",
    )
    .populate("job", "title company")
    .sort({ createdAt: -1 })
    .lean();
};

// Recruiter updates an application's status.
export const updateApplicationStatus = async (
  recruiterId,
  applicationId,
  status,
) => {
  const allowedStatuses = [
    "pending",
    "reviewed",
    "shortlisted",
    "rejected",
    "hired",
  ];

  if (!mongoose.isValidObjectId(applicationId)) {
    throw createError("Invalid application ID", 400);
  }

  if (!allowedStatuses.includes(status)) {
    throw createError("Invalid application status", 400);
  }

  const application = await Application.findById(applicationId);

  if (!application) {
    throw createError("Application not found", 404);
  }

  const job = await Job.findOne({
    _id: application.job,
    createdBy: recruiterId,
  });

  if (!job) {
    throw createError("You are not allowed to update this application", 403);
  }

  application.status = status;

  await application.save();

  return application;
};
