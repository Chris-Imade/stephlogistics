const express = require("express");
const router = express.Router();
const Newsletter = require("../models/Newsletter");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Subscribe to newsletter
router.post("/subscribe", async (req, res) => {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if already subscribed
    const existingSubscriber = await Newsletter.findOne({ email });

    if (existingSubscriber) {
      return res.status(400).json({
        success: false,
        message: "This email is already subscribed to our newsletter",
      });
    }

    // Create new subscriber
    const newSubscriber = new Newsletter({
      email,
      subscriptionDate: new Date(),
      status: "active",
    });

    await newSubscriber.save();

    res.status(201).json({
      success: true,
      message: "Successfully subscribed to the newsletter!",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing your subscription",
    });
  }
});

// Unsubscribe from newsletter using token
router.get("/unsubscribe/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // In a real application, verify the token and find the subscriber
    // For now, just render the unsubscribe page

    res.render("newsletter/unsubscribe", {
      title: "Unsubscribe - Steph Logistics",
      layout: "layouts/main",
      token,
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.status(500).render("error", {
      title: "Error - Steph Logistics",
      layout: "layouts/main",
      error: "An error occurred while processing your unsubscribe request",
    });
  }
});

// Confirm unsubscribe
router.post("/unsubscribe/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // In a real application, verify the token and update the subscriber status
    // For now, just redirect to the confirmation page

    res.redirect("/newsletter/unsubscribe-success");
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    res.status(500).render("error", {
      title: "Error - Steph Logistics",
      layout: "layouts/main",
      error: "An error occurred while processing your unsubscribe request",
    });
  }
});

// Confirm subscription using token
router.get("/confirm/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // In a real application, verify the token and update the subscriber status
    // For now, just render the confirmation page

    res.render("newsletter/confirmation", {
      title: "Subscription Confirmed - Steph Logistics",
      layout: "layouts/main",
    });
  } catch (error) {
    console.error("Newsletter confirmation error:", error);
    res.status(500).render("error", {
      title: "Error - Steph Logistics",
      layout: "layouts/main",
      error: "An error occurred while confirming your subscription",
    });
  }
});

// Unsubscribe success page
router.get("/unsubscribe-success", (req, res) => {
  res.render("newsletter/unsubscribe-success", {
    title: "Unsubscription Successful - Steph Logistics",
    layout: "layouts/main",
  });
});

// Admin route - export subscribers
router.get("/admin/export", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ status: "active" })
      .select("email subscriptionDate")
      .sort({ subscriptionDate: -1 });

    // Generate CSV
    let csv = "Email,Subscription Date\n";
    subscribers.forEach((sub) => {
      csv += `${sub.email},${sub.subscriptionDate.toISOString()}\n`;
    });

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=newsletter-subscribers.csv"
    );
    res.status(200).send(csv);
  } catch (error) {
    console.error("Newsletter export error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while exporting newsletter subscribers",
    });
  }
});

module.exports = router;
