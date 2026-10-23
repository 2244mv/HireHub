import { Router } from "express";

import {
  register,
  login,
  getCurrentUser,
  logout,
} from "../controllers/authController.js";

import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Authenticated route
router.get("/me", authMiddleware, getCurrentUser);

// Logout route
router.post("/logout", logout);

export default router;
