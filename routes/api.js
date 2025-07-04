const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");

// Create a new shipment
router.post("/shipments/create", async (req, res) => {
  try {
    const shipment = new Shipment(req.body);
    await shipment.save();
    res.json({ success: true, shipment: { id: shipment._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
