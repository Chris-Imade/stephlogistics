const express = require("express");
const router = express.Router();

// Careers page route handler
router.get("/", (req, res) => {
  res.render("careers/index", {
    title: "Careers - Steph Logistics",
    layout: "layouts/main",
  });
});

// Job details page
router.get("/:id", (req, res) => {
  const jobId = req.params.id;

  // Mock job data - in a real app, retrieve from database
  const job = {
    id: jobId,
    title: "Logistics Coordinator",
    location: "London, UK",
    department: "Operations",
    type: "Full-time",
    description: "Detailed job description here",
    requirements: [
      "Bachelor's degree in Supply Chain, Logistics, or related field",
      "2+ years of experience in logistics coordination",
      "Excellent communication skills",
    ],
    responsibilities: [
      "Coordinate shipment deliveries",
      "Monitor inventory levels",
      "Liaise with carriers and vendors",
    ],
  };

  res.render("careers/details", {
    title: `${job.title} - Careers - Steph Logistics`,
    layout: "layouts/main",
    job: job,
  });
});

// Job application submission
router.post("/apply/:id", (req, res) => {
  const jobId = req.params.id;

  // Process job application - in a real app, save to database
  res.render("careers/application-success", {
    title: "Application Submitted - Steph Logistics",
    layout: "layouts/main",
  });
});

module.exports = router;
