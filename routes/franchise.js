const express = require("express");
const router = express.Router();
const Franchise = require("../models/Franchise");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const {
  sendFranchiseConfirmation,
  sendFranchiseAdminNotification,
} = require("../config/email");

// Main franchise page
router.get("/", (req, res) => {
  res.render("franchise/index", {
    title: "Franchise Opportunities - Steph Logistics",
    layout: "layouts/main",
  });
});

// Franchise application form submission
router.post("/apply", async (req, res) => {
  try {
    // Extract data from req.body
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      investment,
      experience,
      timeline,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !investment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required information",
      });
    }

    // Map investment values to match the enum values in the Franchise model
    let investmentCapability;
    switch (investment) {
      case "50000-75000":
        investmentCapability = "$50k-$100k";
        break;
      case "75000-100000":
        investmentCapability = "$100k-$150k";
        break;
      case "100000+":
        investmentCapability = "$150k-$200k";
        break;
      default:
        investmentCapability = "$50k-$100k";
    }

    // Create applicant data
    const applicantData = {
      applicantName: `${firstName} ${lastName}`,
      email,
      phone,
      address: {
        street: "N/A", // Default value to pass validation
        city: "N/A", // Default value to pass validation
        state: "N/A", // Default value to pass validation
        postalCode: "N/A", // Default value to pass validation
        country: "N/A", // Default value to pass validation
      },
      businessExperience: experience || "",
      investmentCapability,
      preferredLocation: location || "",
      applicationStatus: "pending",
      comments: `Timeline: ${timeline || "Not specified"}`,
    };

    // Save to database
    const application = new Franchise(applicantData);
    await application.save();

    // Send confirmation email to applicant
    const applicantDetails = {
      firstName,
      lastName,
      email,
      phone,
      location,
      investment,
      experience,
      timeline,
    };

    try {
      await sendFranchiseConfirmation(email, applicantDetails);
    } catch (emailError) {
      console.error(
        "Failed to send confirmation email to applicant:",
        emailError
      );
      // Continue with the process even if email sending fails
    }

    // Send notification to admin
    try {
      await sendFranchiseAdminNotification(applicantDetails);
    } catch (emailError) {
      console.error("Failed to send notification email to admin:", emailError);
      // Continue with the process even if email sending fails
    }

    // Send success response
    res.json({
      success: true,
      message:
        "Your franchise application has been received. We will contact you shortly.",
    });
  } catch (error) {
    console.error("Franchise application submission error:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while submitting your application. Please try again or contact us directly.",
    });
  }
});

// Franchise opportunity details
router.get("/opportunity-details", (req, res) => {
  res.render("franchise/details", {
    title: "Franchise Details - Steph Logistics",
    layout: "layouts/main",
  });
});

// Franchise success stories
router.get("/success-stories", (req, res) => {
  res.render("franchise/success-stories", {
    title: "Franchise Success Stories - Steph Logistics",
    layout: "layouts/main",
  });
});

// Admin: List franchise applications (API)
router.get(
  "/admin/applications",
  isAuthenticated,
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
  isAuthenticated,
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
  isAuthenticated,
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
  isAuthenticated,
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
