import {
  createJob,
  getJobs,
  getJobById,
  getRecruiterDashboard,
  updateRecruiterJob,
  deleteRecruiterJob,
} from "../services/jobService.js";

// Create a job
export const createJobController = async (req, res, next) => {
  try {
    const job = await createJob(req.body, req.user._id);

    return res.status(201).json({
      success: true,
      message: "Job created successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// Get jobs with search, filters, sorting and pagination
export const getJobsController = async (req, res, next) => {
  try {
    const result = await getJobs(req.query);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Get a single job
export const getJobByIdController = async (req, res, next) => {
  try {
    const job = await getJobById(req.params.id);

    return res.status(200).json({
      success: true,
      job,
    });
  } catch (error) {
    next(error);
  }
};

// Get recruiter dashboard
export const getRecruiterDashboardController = async (req, res, next) => {
  try {
    const result = await getRecruiterDashboard(req.user._id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

// Update a recruiter's own job
export const updateJobController = async (req, res, next) => {
  try {
    const job = await updateRecruiterJob(req.params.id, req.body, req.user._id);

    return res.status(200).json({
      success: true,
      message: "Job updated successfully",
      job,
    });
  } catch (error) {
    next(error);
  }
};

// Delete a recruiter's job
export const deleteJobController = async (req, res, next) => {
  try {
    const result = await deleteRecruiterJob(req.params.id, req.user._id);

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
