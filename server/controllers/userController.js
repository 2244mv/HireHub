import User from "../models/User.js";

const profileFields = [
  "name",
  "avatar",
  "phone",
  "headline",
  "bio",
  "skills",
  "experienceLevel",
  "education",
  "resumeUrl",
  "linkedinUrl",
  "githubUrl",
];

const stringFields = [
  "name",
  "avatar",
  "phone",
  "headline",
  "bio",
  "experienceLevel",
  "education",
  "resumeUrl",
  "linkedinUrl",
  "githubUrl",
];

const urlFields = ["avatar", "resumeUrl", "linkedinUrl", "githubUrl"];

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const getProfileCompletion = (user) => {
  const fields = [
    user.name,
    user.phone,
    user.headline,
    user.bio,
    user.skills?.length ? "skills" : "",
    user.experienceLevel,
    user.education,
    user.resumeUrl,
  ];

  const completed = fields.filter((field) =>
    typeof field === "string" ? field.trim() !== "" : Boolean(field),
  ).length;

  return Math.round((completed / fields.length) * 100);
};

const formatProfile = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar || "",
  phone: user.phone || "",
  headline: user.headline || "",
  bio: user.bio || "",
  skills: user.skills || [],
  experienceLevel: user.experienceLevel || "",
  education: user.education || "",
  resumeUrl: user.resumeUrl || "",
  linkedinUrl: user.linkedinUrl || "",
  githubUrl: user.githubUrl || "",
  profileCompletion: getProfileCompletion(user),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

// Get the logged-in candidate's profile.
export const getMyProfileController = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: formatProfile(user),
    });
  } catch (error) {
    return next(error);
  }
};

// Update the logged-in candidate's profile.
export const updateMyProfileController = async (req, res, next) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const body = req.body || {};
    const updates = {};

    // Allow only approved profile fields.
    for (const field of profileFields) {
      if (Object.prototype.hasOwnProperty.call(body, field)) {
        updates[field] = body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid profile fields provided",
      });
    }

    // Validate and normalize string fields.
    for (const field of stringFields) {
      if (updates[field] === undefined) continue;

      if (typeof updates[field] !== "string") {
        return res.status(400).json({
          success: false,
          message: `${field} must be a string`,
        });
      }

      updates[field] = updates[field].trim();
    }

    // Validate name.
    if (
      updates.name !== undefined &&
      (updates.name.length < 2 || updates.name.length > 50)
    ) {
      return res.status(400).json({
        success: false,
        message: "Name must contain between 2 and 50 characters",
      });
    }

    // Validate skills.
    if (updates.skills !== undefined) {
      if (
        !Array.isArray(updates.skills) ||
        !updates.skills.every((skill) => typeof skill === "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Skills must be an array of strings",
        });
      }

      updates.skills = [
        ...new Set(updates.skills.map((skill) => skill.trim()).filter(Boolean)),
      ].slice(0, 30);
    }

    // Validate experience level against the User schema.
    const allowedExperienceLevels = [
      "fresher",
      "0-1 years",
      "1-3 years",
      "3-5 years",
      "5+ years",
      "",
    ];

    if (
      updates.experienceLevel !== undefined &&
      !allowedExperienceLevels.includes(updates.experienceLevel)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid experience level",
      });
    }

    // Validate optional URLs.
    for (const field of urlFields) {
      const value = updates[field];

      if (value === undefined || value === "") continue;

      try {
        const parsedUrl = new URL(value);

        if (!["http:", "https:"].includes(parsedUrl.protocol)) {
          throw new Error("Invalid URL protocol");
        }
      } catch {
        return res.status(400).json({
          success: false,
          message: `${field} must be a valid HTTP or HTTPS URL`,
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: formatProfile(user),
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return next(error);
  }
};
