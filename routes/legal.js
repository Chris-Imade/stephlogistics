const express = require("express");
const router = express.Router();

// Terms & Conditions
router.get("/terms", (req, res) => {
  res.render("legal/terms", {
    title: "Terms & Conditions - Steph Logistics",
    layout: "layouts/main",
  });
});

// Privacy Policy
router.get("/privacy", (req, res) => {
  res.render("legal/privacy", {
    title: "Privacy Policy - Steph Logistics",
    layout: "layouts/main",
  });
});

// Cookie Policy
router.get("/cookies", (req, res) => {
  res.render("legal/cookies", {
    title: "Cookie Policy - Steph Logistics",
    layout: "layouts/main",
  });
});

module.exports = router;
