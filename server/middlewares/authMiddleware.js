import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // 1. Check authentication token in cookies.
    const token = req.cookies?.hirehub_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Please login first",
      });
    }

    // 2. Ensure JWT secret is configured.
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing from environment variables");

      return res.status(500).json({
        success: false,
        message: "Server authentication is not configured",
      });
    }

    // 3. Verify the token.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || typeof decoded.userId !== "string" || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication token. Please login again.",
      });
    }

    // 4. Find the user without exposing their password.
    const user = await User.findById(decoded.userId).select("-password");

    // 5. Ensure the account exists and is active.
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: "User not found or account is inactive",
      });
    }

    // 6. Attach authenticated user to the request.
    req.user = user;

    // 7. Continue to the next middleware or controller.
    return next();
  } catch (error) {
    // Invalid or expired JWT.
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError" ||
      error.name === "NotBeforeError"
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token. Please login again.",
      });
    }

    // Unexpected database or server errors.
    console.error("Authentication error:", error);

    return next(error);
  }
};

export default authMiddleware;
