const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticateUser = async (req, res, next) => {
  try {
    // Get token from either cookie or auth header
    const token =
      req.cookies.token ||
      (req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
        ? req.headers.authorization.split(" ")[1]
        : null);

    if (!token) {
      return res.redirect(
        "/auth/login?message=Please login to access this page"
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "jwt_secret");

    // Get user from database
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.redirect(
        "/auth/login?message=User not found. Please login again"
      );
    }

    // Set user in request object
    req.user = user;
    res.locals.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.redirect(
      "/auth/login?message=Authentication failed. Please login again"
    );
  }
};

// Check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  res.status(403).render("error", {
    title: "Access Denied",
    layout: "layouts/main",
    message: "You do not have permission to access this resource",
  });
};

// Check if user is staff or admin
const isStaffOrAdmin = (req, res, next) => {
  if (req.user && (req.user.role === "staff" || req.user.role === "admin")) {
    return next();
  }

  res.status(403).render("error", {
    title: "Access Denied",
    layout: "layouts/main",
    message: "You do not have permission to access this resource",
  });
};

module.exports = {
  authenticateUser,
  isAdmin,
  isStaffOrAdmin,
};
