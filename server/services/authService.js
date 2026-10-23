import bcrypt from "bcryptjs";
import User from "../models/User.js";

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) => {
  if (typeof email !== "string") {
    throw createError("Valid email is required", 400);
  }

  return email.trim().toLowerCase();
};

// Register a new user.
export const registerUser = async ({ name, email, password, role }) => {
  if (typeof name !== "string" || typeof password !== "string") {
    throw createError("Name and password are required", 400);
  }

  const cleanName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (cleanName.length < 2) {
    throw createError("Name must contain at least 2 characters", 400);
  }

  if (password.length < 8) {
    throw createError("Password must be at least 8 characters", 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw createError("Please enter a valid email address", 400);
  }

  if (role && !["candidate", "recruiter"].includes(role)) {
    throw createError("Invalid role", 400);
  }

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    throw createError("Email is already registered", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  try {
    const user = await User.create({
      name: cleanName,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "candidate",
    });

    // Never return the password or password hash.
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar || "",
      createdAt: user.createdAt,
    };
  } catch (error) {
    // Protect against simultaneous duplicate registrations.
    if (error.code === 11000) {
      throw createError("Email is already registered", 409);
    }

    if (error.name === "ValidationError") {
      throw createError(error.message, 400);
    }

    throw error;
  }
};

// Authenticate an existing user.
export const loginUser = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);

  if (typeof password !== "string" || !password) {
    throw createError("Email and password are required", 400);
  }

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  // Use the same message for unknown email and wrong password.
  if (!user) {
    throw createError("Invalid email or password", 401);
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createError("Invalid email or password", 401);
  }

  if (!user.isActive) {
    throw createError("Your account is inactive", 403);
  }

  // Return only safe user fields.
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar || "",
  };
};
