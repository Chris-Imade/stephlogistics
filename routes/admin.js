const express = require("express");
const router = express.Router();

// Import controllers
const authController = require("../controllers/auth");
const adminController = require("../controllers/admin");

// Import middleware
const { isAuthenticated, isAdmin, isStaff } = require("../middleware/auth");

// Authentication routes
router.get("/login", authController.getLoginPage);
router.post("/login", authController.login);
router.get("/logout", isAuthenticated, authController.logout);

// Password reset
router.get("/forgot-password", authController.getForgotPasswordPage);
router.post("/forgot-password", authController.forgotPassword);
router.get("/reset-password/:token", authController.getResetPasswordPage);
router.post("/reset-password/:token", authController.resetPassword);

// Admin dashboard
router.get("/", isAuthenticated, isAdmin, adminController.getDashboard);

// Users management
router.get("/users", isAuthenticated, isAdmin, adminController.getUsers);
router.post("/users", isAuthenticated, isAdmin, adminController.postUser);
router.get("/users/:id", isAuthenticated, isAdmin, adminController.getUser);
router.delete(
  "/users/:id",
  isAuthenticated,
  isAdmin,
  adminController.deleteUser
);

// Shipments management
router.get(
  "/shipments",
  isAuthenticated,
  isAdmin,
  adminController.getShipments
);
router.get(
  "/shipments/create",
  isAuthenticated,
  isAdmin,
  adminController.getCreateShipment
);
router.post(
  "/shipments",
  isAuthenticated,
  isAdmin,
  adminController.createShipment
);
router.put(
  "/shipments/:id",
  isAuthenticated,
  isAdmin,
  adminController.updateShipment
);
router.delete(
  "/shipments/:id",
  isAuthenticated,
  isAdmin,
  adminController.deleteShipment
);

// Analytics - using getDashboard as a fallback since getAnalyticsPage doesn't exist
router.get(
  "/analytics",
  isAuthenticated,
  isAdmin,
  adminController.getDashboard
);

// Settings
router.get("/settings", isAuthenticated, isAdmin, adminController.getSettings);
router.post(
  "/settings",
  isAuthenticated,
  isAdmin,
  adminController.postSettings
);

// Newsletter management
router.get(
  "/newsletter",
  isAuthenticated,
  isAdmin,
  adminController.getNewsletterSubscribers
);
router.get(
  "/newsletter/export-csv",
  isAuthenticated,
  isAdmin,
  adminController.exportNewsletterCSV
);
router.delete(
  "/newsletter/:id",
  isAuthenticated,
  isAdmin,
  adminController.deleteNewsletterSubscriber
);

// Setup route (for initial admin creation) - should be removed or secured in production
if (process.env.NODE_ENV !== "production") {
  router.post("/setup", authController.createAdminUser);
}

module.exports = router;
