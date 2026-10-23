import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
      minlength: [2, "Job title must be at least 2 characters"],
      maxlength: [100, "Job title cannot exceed 100 characters"],
    },

    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
      minlength: [20, "Description must be at least 20 characters"],
    },

    location: {
      type: String,
      required: [true, "Job location is required"],
      trim: true,
    },

    jobType: {
      type: String,
      enum: {
        values: ["full-time", "part-time", "internship", "contract"],
        message: "Please select a valid job type",
      },
      required: [true, "Job type is required"],
    },

    workMode: {
      type: String,
      enum: {
        values: ["onsite", "remote", "hybrid"],
        message: "Please select a valid work mode",
      },
      default: "onsite",
    },

    experienceLevel: {
      type: String,
      enum: {
        values: ["fresher", "junior", "mid", "senior"],
        message: "Please select a valid experience level",
      },
      default: "fresher",
    },

    salaryMin: {
      type: Number,
      min: [0, "Minimum salary cannot be negative"],
      default: null,
    },

    salaryMax: {
      type: Number,
      min: [0, "Maximum salary cannot be negative"],
      default: null,
    },

    skills: {
      type: [String],
      default: [],
    },

    openings: {
      type: Number,
      min: [1, "At least one opening is required"],
      default: 1,
    },

    status: {
      type: String,
      enum: {
        values: ["active", "closed"],
        message: "Job status must be active or closed",
      },
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Recruiter is required"],
    },
  },
  {
    timestamps: true,
  },
);

// Validate the salary range.
jobSchema.pre("validate", function () {
  if (
    this.salaryMin != null &&
    this.salaryMax != null &&
    this.salaryMin > this.salaryMax
  ) {
    this.invalidate(
      "salaryMax",
      "Maximum salary must be greater than or equal to minimum salary",
    );
  }
});

// Text index for job search.
jobSchema.index({
  title: "text",
  company: "text",
  description: "text",
});

const Job = mongoose.model("Job", jobSchema);

export default Job;
