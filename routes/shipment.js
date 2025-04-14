const express = require("express");
const router = express.Router();

// Controllers
const shipmentController = require("../controllers/shipment");

// Tracking page
router.get("/track", shipmentController.getTrackingPage);
router.post("/track", shipmentController.trackShipment);

// New shipment request
router.get("/request", shipmentController.getRequestPage);
router.post("/request", shipmentController.createShipmentRequest);

// Create shipment page
router.get("/create", shipmentController.getCreateShipmentPage);
router.post("/create", shipmentController.createShipment);

module.exports = router;
