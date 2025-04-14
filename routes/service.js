const express = require("express");
const router = express.Router();

// Controllers
const serviceController = require("../controllers/service");

// Specific service pages (these must come before the parametric route)
router.get(
  "/ecommerce-integration",
  serviceController.getEcommerceIntegrationPage
);
router.get("/dxpress-journal", serviceController.getDxpressJournalPage);
router.get(
  "/international-shipping",
  serviceController.getInternationalShippingPage
);

// Main services page and parametric route
router.get("/", serviceController.getServicesPage);
router.get("/:id", serviceController.getServiceDetailsPage);

module.exports = router;
