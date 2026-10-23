import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        "Please enter a valid email address",
      ],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["candidate", "recruiter"],
      default: "candidate",
    },

    avatar: {
      type: String,
      default: "",
    },

    // Candidate profile fields
    phone: {
      type: String,
      trim: true,
      default: "",
      maxlength: [20, "Phone number cannot exceed 20 characters"],
    },

    headline: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Headline cannot exceed 120 characters"],
    },

    bio: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Bio cannot exceed 1000 characters"],
    },

    skills: {
      type: [String],
      default: [],
    },

    experienceLevel: {
      type: String,
      enum: ["fresher", "0-1 years", "1-3 years", "3-5 years", "5+ years", ""],
      default: "",
    },

    education: {
      type: String,
      trim: true,
      default: "",
      maxlength: [200, "Education cannot exceed 200 characters"],
    },

    resumeUrl: {
      type: String,
      trim: true,
      default: "",
    },

    linkedinUrl: {
      type: String,
      trim: true,
      default: "",
    },

    githubUrl: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const User = mongoose.model("User", userSchema);

export default User;
