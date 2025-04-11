const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");
const { authenticateUser, isAdmin } = require("../middleware/auth");

// Unsubscribe from newsletter
router.get("/unsubscribe/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Find subscriber by token
    const subscriber = await Newsletter.findOne({ token });

    if (!subscriber) {
      return res.render("newsletter/unsubscribe", {
        title: "Unsubscribe - DXpress",
        layout: "layouts/main",
        error: "Invalid unsubscribe token",
      });
    }

    // Update subscriber status
    subscriber.isSubscribed = false;
    subscriber.unsubscribedAt = Date.now();
    await subscriber.save();

    res.render("newsletter/unsubscribe", {
      title: "Unsubscribe - DXpress",
      layout: "layouts/main",
      email: subscriber.email,
      success: true,
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.render("newsletter/unsubscribe", {
      title: "Unsubscribe - DXpress",
      layout: "layouts/main",
      error: "An error occurred while processing your request",
    });
  }
});

// Confirm subscription (for double opt-in)
router.get("/confirm/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Find subscriber by token
    const subscriber = await Newsletter.findOne({ token });

    if (!subscriber) {
      return res.render("newsletter/confirm", {
        title: "Confirm Subscription - DXpress",
        layout: "layouts/main",
        error: "Invalid confirmation token",
      });
    }

    // Update subscriber status if not already subscribed
    if (!subscriber.isSubscribed) {
      subscriber.isSubscribed = true;
      subscriber.subscribedAt = Date.now();
      subscriber.unsubscribedAt = null;
      await subscriber.save();
    }

    res.render("newsletter/confirm", {
      title: "Confirm Subscription - DXpress",
      layout: "layouts/main",
      email: subscriber.email,
      success: true,
    });
  } catch (error) {
    console.error("Newsletter confirmation error:", error);
    res.render("newsletter/confirm", {
      title: "Confirm Subscription - DXpress",
      layout: "layouts/main",
      error: "An error occurred while processing your request",
    });
  }
});

// Admin: List subscribers (API)
router.get(
  "/admin/subscribers",
  authenticateUser,
  isAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      // Build query based on status filter
      const query = {};
      if (status === "active") {
        query.isSubscribed = true;
      } else if (status === "inactive") {
        query.isSubscribed = false;
      }

      // Count total subscribers
      const total = await Newsletter.countDocuments(query);

      // Get subscribers with pagination
      const subscribers = await Newsletter.find(query)
        .sort({ subscribedAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      res.status(200).json({
        success: true,
        subscribers,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("Newsletter subscribers list error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching subscribers",
      });
    }
  }
);

// Admin: Export subscribers to CSV (API)
router.get("/admin/export", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { status } = req.query;

    // Build query based on status filter
    const query = {};
    if (status === "active") {
      query.isSubscribed = true;
    } else if (status === "inactive") {
      query.isSubscribed = false;
    }

    // Get subscribers
    const subscribers = await Newsletter.find(query).sort({ subscribedAt: -1 });

    // Create CSV content
    let csv = "Email,Name,Subscribed Date,Status\n";

    subscribers.forEach((subscriber) => {
      const subscribedDate = subscriber.subscribedAt
        ? new Date(subscriber.subscribedAt).toLocaleDateString()
        : "";

      const status = subscriber.isSubscribed ? "Active" : "Inactive";

      csv += `"${subscriber.email}","${
        subscriber.name || ""
      }","${subscribedDate}","${status}"\n`;
    });

    // Set response headers for CSV download
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=subscribers-${Date.now()}.csv`
    );

    res.status(200).send(csv);
  } catch (error) {
    console.error("Newsletter export error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while exporting subscribers",
    });
  }
});

// Admin: Delete subscriber (API)
router.delete(
  "/admin/subscriber/:id",
  authenticateUser,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find and delete subscriber
      const subscriber = await Newsletter.findByIdAndDelete(id);

      if (!subscriber) {
        return res.status(404).json({
          success: false,
          message: "Subscriber not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Subscriber deleted successfully",
      });
    } catch (error) {
      console.error("Newsletter delete error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting subscriber",
      });
    }
  }
);

module.exports = router;
