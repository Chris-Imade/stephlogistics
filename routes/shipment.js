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


// Route to update shipment payment status
router.post("/:id/payment-status", shipmentController.updateShipmentPaymentStatus);

module.exports = router;
