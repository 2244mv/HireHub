import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorMiddleware from "./middlewares/errorMiddleware.js";

dotenv.config();

const app = express();

// 1. Global middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());

// 2. Health check route
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "HireHub API is running!",
  });
});

// 3. API routes
app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/users", userRoutes);

// 4. Error middleware — keep this after all routes
app.use(errorMiddleware);

// 5. Server port
const PORT = process.env.PORT || 8000;

// 6. Connect database before starting server
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`HireHub server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
};

startServer();
