const express = require("express");
const router = express.Router();
const Franchise = require("../models/Franchise");
const { authenticateUser, isAdmin } = require("../middleware/auth");

// Franchise page route
router.get("/", (req, res) => {
  res.render("franchise/index", {
    title: "Franchise Opportunities - DXpress",
    layout: "layouts/main",
  });
});

// Submit franchise application
router.post("/apply", async (req, res) => {
  try {
    const {
      applicantName,
      email,
      phone,
      address,
      businessExperience,
      investmentCapability,
      preferredLocation,
      comments,
    } = req.body;

    // Create new franchise application
    const franchiseApplication = new Franchise({
      applicantName,
      email,
      phone,
      address,
      businessExperience,
      investmentCapability,
      preferredLocation,
      comments,
    });

    await franchiseApplication.save();

    res.status(201).json({
      success: true,
      message:
        "Your franchise application has been submitted successfully. Our team will contact you soon.",
    });
  } catch (error) {
    console.error("Franchise application error:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while submitting your application. Please try again.",
    });
  }
});

// Admin: List franchise applications (API)
router.get(
  "/admin/applications",
  authenticateUser,
  isAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      // Build query based on status filter
      const query = {};
      if (status && status !== "all") {
        query.applicationStatus = status;
      }

      // Count total applications
      const total = await Franchise.countDocuments(query);

      // Get applications with pagination
      const applications = await Franchise.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      res.status(200).json({
        success: true,
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("Franchise applications list error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching franchise applications",
      });
    }
  }
);

// Admin: Get single franchise application (API)
router.get(
  "/admin/application/:id",
  authenticateUser,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find application by ID
      const application = await Franchise.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Franchise application not found",
        });
      }

      res.status(200).json({
        success: true,
        application,
      });
    } catch (error) {
      console.error("Franchise application detail error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching franchise application",
      });
    }
  }
);

// Admin: Update franchise application status (API)
router.patch(
  "/admin/application/:id",
  authenticateUser,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { applicationStatus, comments } = req.body;

      // Find and update application
      const application = await Franchise.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Franchise application not found",
        });
      }

      // Update fields
      application.applicationStatus =
        applicationStatus || application.applicationStatus;

      if (comments) {
        application.comments = comments;
      }

      await application.save();

      res.status(200).json({
        success: true,
        message: "Franchise application updated successfully",
        application,
      });
    } catch (error) {
      console.error("Franchise application update error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating franchise application",
      });
    }
  }
);

// Admin: Delete franchise application (API)
router.delete(
  "/admin/application/:id",
  authenticateUser,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find and delete application
      const application = await Franchise.findByIdAndDelete(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Franchise application not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Franchise application deleted successfully",
      });
    } catch (error) {
      console.error("Franchise application delete error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting franchise application",
      });
    }
  }
);

module.exports = router;
