const VALID_ROLES = ["candidate", "recruiter"];

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    // Ensure authentication middleware ran first.
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please login first.",
      });
    }

    // Validate the roles configured on the route.
    if (
      allowedRoles.length === 0 ||
      allowedRoles.some((role) => !VALID_ROLES.includes(role))
    ) {
      console.error("Invalid role configuration in route middleware");

      return res.status(500).json({
        success: false,
        message: "Server authorization is not configured correctly",
      });
    }

    // Check whether the authenticated user has permission.
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to perform this action",
      });
    }

    return next();
  };
};
