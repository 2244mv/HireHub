import {
  applyForJob,
  getMyApplications,
  getApplicantsForJob,
  updateApplicationStatus,
} from "../services/applicationService.js";

import Application from "../models/Application.js";
import Job from "../models/Job.js";

// Candidate applies for a job.
export const applyForJobController = async (req, res, next) => {
  try {
    const application = await applyForJob(req.user._id, req.body);

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

// Candidate views their own applications.
export const getMyApplicationsController = async (req, res, next) => {
  try {
    const applications = await getMyApplications(req.user._id);

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// Get applicants using the existing service.
export const getApplicantsForJobController = async (req, res, next) => {
  try {
    const applications = await getApplicantsForJob(
      req.user._id,
      req.params.jobId,
    );

    return res.status(200).json({
      success: true,
      count: applications.length,
      applications,
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter updates an application's status.
export const updateApplicationStatusController = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (
      !["pending", "reviewed", "shortlisted", "rejected", "hired"].includes(
        status,
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid application status",
      });
    }

    const application = await updateApplicationStatus(
      req.user._id,
      req.params.applicationId,
      status,
    );

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      application,
    });
  } catch (error) {
    next(error);
  }
};

// Recruiter views applications for their own job.
export const getRecruiterJobApplicationsController = async (req, res, next) => {
  try {
    const job = await Job.findOne({
      _id: req.params.jobId,
      createdBy: req.user._id,
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found or access denied.",
      });
    }

    const applications = await Application.find({
      job: job._id,
    })
      .populate(
        "candidate",
        "name email headline skills experienceLevel resumeUrl linkedinUrl",
      )
      .populate("job", "title company")
      .sort({ createdAt: -1 })
      .lean();

    // Prefer the resume submitted with the application.
    // Otherwise, use the candidate's profile resume URL.
    const formattedApplications = applications.map((application) => ({
      ...application,
      resumeUrl:
        application.resumeUrl || application.candidate?.resumeUrl || "",
    }));

    return res.status(200).json({
      success: true,
      count: formattedApplications.length,
      applications: formattedApplications,
    });
  } catch (error) {
    next(error);
  }
};
