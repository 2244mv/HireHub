import { Router } from "express";
import {
  applyForJobController,
  getMyApplicationsController,
  getRecruiterJobApplicationsController,
  // getApplicantsForJobController,
  updateApplicationStatusController,
} from "../controllers/applicationController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

// Candidate applies for a job
router.post(
  "/",
  authMiddleware,
  requireRole("candidate"),
  applyForJobController,
);

// Candidate views their applications
router.get(
  "/my",
  authMiddleware,
  requireRole("candidate"),
  getMyApplicationsController,
);

// Recruiter views applicants for their own job

router.get(
  "/job/:jobId",
  authMiddleware,
  requireRole("recruiter"),
  getRecruiterJobApplicationsController,
);


router.patch(
  "/:applicationId/status",
  authMiddleware,
  requireRole("recruiter"),
  updateApplicationStatusController,
);

export default router;
