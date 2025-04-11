const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");
const Newsletter = require("../models/Newsletter");
const {
  sendContactConfirmation,
  sendWelcomeEmail,
} = require("../config/email");

// Home page route
router.get("/", (req, res) => {
  res.render("index", {
    title: "StephLogistics - Transport & Logistics",
    layout: "layouts/main",
  });
});

// About page route
router.get("/about", (req, res) => {
  res.render("about", {
    title: "About Us - StephLogistics",
    layout: "layouts/main",
  });
});

// Services page route
router.get("/services", (req, res) => {
  res.render("service", {
    title: "Our Services - StephLogistics",
    layout: "layouts/main",
  });
});

// Service details page route
router.get("/services/:id", (req, res) => {
  res.render("service-details", {
    title: "Service Details - StephLogistics",
    layout: "layouts/main",
    serviceId: req.params.id,
  });
});

// Team page route
router.get("/team", (req, res) => {
  res.render("team", {
    title: "Our Team - StephLogistics",
    layout: "layouts/main",
  });
});

// Contact page route
router.get("/contact", (req, res) => {
  res.render("contact", {
    title: "Contact Us - StephLogistics",
    layout: "layouts/main",
  });
});

// Blog page route
router.get("/blog", (req, res) => {
  res.render("blog", {
    title: "Blog - StephLogistics",
    layout: "layouts/main",
  });
});

// Blog details page route
router.get("/blog/:id", (req, res) => {
  res.render("/blog/blog-details", {
    title: "Blog Details - StephLogistics",
    layout: "layouts/main",
    blogId: req.params.id,
  });
});

// 404 page route
router.get("/404", (req, res) => {
  res.status(404).render("404", {
    title: "404 - Page Not Found",
    layout: "layouts/main",
  });
});

// Process contact form
router.post("/contact", async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Create new contact in database
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await contact.save();

    // Send confirmation email
    await sendContactConfirmation(email, { name, subject, message });

    res.status(200).json({
      success: true,
      message:
        "Your message has been sent successfully. We will get back to you soon.",
    });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while sending your message. Please try again.",
    });
  }
});

// Process newsletter subscription
router.post("/newsletter/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    // Check if email already exists
    let subscriber = await Newsletter.findOne({ email });

    if (subscriber) {
      // If unsubscribed before, re-subscribe
      if (!subscriber.isSubscribed) {
        subscriber.isSubscribed = true;
        subscriber.subscribedAt = Date.now();
        subscriber.unsubscribedAt = null;
        await subscriber.save();

        // Send welcome email
        await sendWelcomeEmail(email, subscriber.token);

        return res.status(200).json({
          success: true,
          message: "You have been re-subscribed to our newsletter.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "This email is already subscribed to our newsletter.",
      });
    }

    // Create new subscriber
    const newSubscriber = new Newsletter({
      email,
      name: name || "",
    });

    await newSubscriber.save();

    // Send welcome email
    await sendWelcomeEmail(email, newSubscriber.token);

    res.status(200).json({
      success: true,
      message: "You have been subscribed to our newsletter.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while processing your subscription. Please try again.",
    });
  }
});

module.exports = router;
