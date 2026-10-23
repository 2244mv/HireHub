import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: [true, "Job is required"],
    },

    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Candidate is required"],
    },

    coverLetter: {
      type: String,
      trim: true,
      maxlength: [2000, "Cover letter cannot exceed 2000 characters"],
      default: "",
    },

    resumeUrl: {
      type: String,
      trim: true,
      default: "",
      validate: {
        validator(value) {
          if (!value) return true;

          try {
            const url = new URL(value);
            return ["http:", "https:"].includes(url.protocol);
          } catch {
            return false;
          }
        },
        message: "Resume URL must be a valid HTTP or HTTPS URL",
      },
    },

    status: {
      type: String,
      enum: {
        values: ["pending", "reviewed", "shortlisted", "rejected", "hired"],
        message: "Invalid application status",
      },
      default: "pending",
    },
  },
  {
    timestamps: true,
  },
);

// Prevent duplicate applications from the same candidate for the same job.
applicationSchema.index({ job: 1, candidate: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

export default Application;
