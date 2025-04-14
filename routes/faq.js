const express = require("express");
const router = express.Router();

// FAQ page route handler
router.get("/", (req, res) => {
  res.render("faq/index", {
    title: "FAQ - Steph Logistics",
    layout: "layouts/main"
  });
});

module.exports = router; 