import { Router } from "express";

import {
  getMyProfileController,
  updateMyProfileController,
} from "../controllers/userController.js";

import authMiddleware from "../middlewares/authMiddleware.js";
import { requireRole } from "../middlewares/requireRole.js";

const router = Router();

// Protect all profile routes.
// Only authenticated candidates can access these endpoints.
router.use(authMiddleware, requireRole("candidate"));

// Get the logged-in candidate's profile.
router.get("/profile", getMyProfileController);

// Update the logged-in candidate's profile.
router.patch("/profile", updateMyProfileController);

export default router;
