const express = require("express");
const router = express.Router();

// Home page route handler (or controller if available)
router.get("/", (req, res) => {
  res.render("pricing/index", {
    title: "Pricing - Steph Logistics",
    layout: "layouts/main",
  });
});

module.exports = router;
