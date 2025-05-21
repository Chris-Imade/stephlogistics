const express = require("express");
const router = express.Router();
const Quote = require("../models/quote");
const {
  sendQuoteConfirmation,
  sendQuoteAdminNotification,
} = require("../config/email");

// Get quote page
router.get("/", (req, res) => {
  res.render("quotes/index", {
    title: "Get a Quote - Steph Logistics",
    extraCSS: '<link rel="stylesheet" href="/assets/css/quotes.css">',
    extraJS: '<script src="/assets/js/quotes.js"></script>',
  });
});

// Submit quote request
router.post("/submit", async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      company,
      serviceType,
      origin,
      destination,
      weight,
      dimensions,
      specialRequirements,
      message,
    } = req.body;

    // Create new quote request
    const quote = new Quote({
      name,
      email,
      phone,
      company,
      serviceType,
      origin,
      destination,
      weight,
      dimensions,
      specialRequirements,
      message,
      status: "pending",
    });

    await quote.save();

    // Send confirmation email to customer
    await sendQuoteConfirmation(email, {
      name,
      serviceType,
      quoteId: quote._id,
    });

    // Send notification to admin
    await sendQuoteAdminNotification({
      name,
      email,
      phone,
      company,
      serviceType,
      quoteId: quote._id,
    });

    res.json({
      success: true,
      message:
        "Your quote request has been submitted successfully. We will contact you shortly.",
    });
  } catch (error) {
    console.error("Quote submission error:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while submitting your quote request. Please try again.",
    });
  }
});

module.exports = router;
