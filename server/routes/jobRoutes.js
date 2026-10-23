import { Router } from "express";

import {
  createJobController,
  getJobsController,
  getJobByIdController,
  getRecruiterDashboardController,
  updateJobController,
  deleteJobController,
} from "../controllers/jobController.js";

import { requireRole } from "../middlewares/requireRole.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.get("/", getJobsController);

// Recruiter dashboard
router.get(
  "/my",
  authMiddleware,
  requireRole("recruiter"),
  getRecruiterDashboardController,
);

// Public job details
router.get("/:id", getJobByIdController);

// Recruiter creates a job
router.post("/", authMiddleware, requireRole("recruiter"), createJobController);

// Recruiter edits their own job
router.patch(
  "/:id",
  authMiddleware,
  requireRole("recruiter"),
  updateJobController,
);

// Recruiter deletes their own job
router.delete(
  "/:id",
  authMiddleware,
  requireRole("recruiter"),
  deleteJobController,
);

export default router;
