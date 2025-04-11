const express = require("express");
const router = express.Router();
const Shipment = require("../models/Shipment");
const { authenticateUser } = require("../middleware/auth");
const { sendShipmentConfirmation } = require("../config/email");

// Shipment creation page - Step 1: Shipment Details
router.get("/create", (req, res) => {
  res.render("shipment/create-step1", {
    title: "Create Shipment - Details",
    layout: "layouts/main",
    currentStep: 1,
  });
});

// Shipment creation page - Step 2: Compare Rates
router.get("/create/compare-rates", (req, res) => {
  res.render("shipment/create-step2", {
    title: "Create Shipment - Compare Rates",
    layout: "layouts/main",
    currentStep: 2,
  });
});

// Shipment creation page - Step 3: Payment
router.get("/create/payment", (req, res) => {
  res.render("shipment/create-step3", {
    title: "Create Shipment - Payment",
    layout: "layouts/main",
    currentStep: 3,
  });
});

// Shipment creation page - Step 4: Confirmation
router.get("/create/confirmation", (req, res) => {
  res.render("shipment/create-step4", {
    title: "Create Shipment - Confirmation",
    layout: "layouts/main",
    currentStep: 4,
  });
});

// Shipment tracking page
router.get("/track", (req, res) => {
  res.render("shipment/track", {
    title: "Track Shipment",
    layout: "layouts/main",
  });
});

// Shipping quote page
router.get("/quote", (req, res) => {
  res.render("shipment/quote", {
    title: "Get a Shipping Quote",
    layout: "layouts/main",
  });
});

// Shipment tracking result page
router.get("/track/:trackingNumber", async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    // Find shipment by tracking number
    const shipment = await Shipment.findOne({ trackingNumber });

    if (!shipment) {
      return res.render("shipment/track-result", {
        title: "Tracking Result",
        layout: "layouts/main",
        error: "No shipment found with that tracking number",
      });
    }

    res.render("shipment/track-result", {
      title: "Tracking Result",
      layout: "layouts/main",
      shipment,
    });
  } catch (error) {
    console.error("Shipment tracking error:", error);
    res.render("shipment/track-result", {
      title: "Tracking Result",
      layout: "layouts/main",
      error: "An error occurred while tracking your shipment",
    });
  }
});

// Submit shipment details (API)
router.post("/create/details", async (req, res) => {
  try {
    const shipmentData = req.body;

    // Store shipment data in session for next steps
    req.session.shipmentData = {
      ...shipmentData,
      step: 1,
    };

    res.status(200).json({
      success: true,
      message: "Shipment details saved",
      redirectTo: "/shipment/create/compare-rates",
    });
  } catch (error) {
    console.error("Shipment details error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while saving shipment details",
    });
  }
});

// Get shipping rates (API)
router.post("/create/rates", async (req, res) => {
  try {
    // In a real application, this would call carrier APIs to get rates
    // For now, return mock shipping rates

    const mockRates = [
      {
        carrier: "DHL",
        service: "Express",
        rate: {
          value: 45.75,
          currency: "USD",
        },
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      },
      {
        carrier: "FedEx",
        service: "Priority",
        rate: {
          value: 52.3,
          currency: "USD",
        },
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
      },
      {
        carrier: "UPS",
        service: "Ground",
        rate: {
          value: 38.95,
          currency: "USD",
        },
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      },
    ];

    // Store rates in session for next steps
    if (req.session.shipmentData) {
      req.session.shipmentData.rates = mockRates;
      req.session.shipmentData.step = 2;
    }

    res.status(200).json({
      success: true,
      rates: mockRates,
    });
  } catch (error) {
    console.error("Shipping rates error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching shipping rates",
    });
  }
});

// Select shipping rate (API)
router.post("/create/select-rate", async (req, res) => {
  try {
    const { carrier, service, rate, estimatedDelivery } = req.body;

    // Store selected rate in session
    if (req.session.shipmentData) {
      req.session.shipmentData.selectedRate = {
        carrier,
        service,
        rate,
        estimatedDelivery,
      };
      req.session.shipmentData.step = 3;
    }

    res.status(200).json({
      success: true,
      message: "Shipping rate selected",
      redirectTo: "/shipment/create/payment",
    });
  } catch (error) {
    console.error("Rate selection error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while selecting shipping rate",
    });
  }
});

// Process payment and create shipment (API)
router.post("/create/process-payment", async (req, res) => {
  try {
    const { paymentMethod, paymentDetails } = req.body;

    // In a real application, this would process the payment through Stripe or PayPal
    const paymentSuccessful = true;

    if (!paymentSuccessful) {
      return res.status(400).json({
        success: false,
        message: "Payment failed. Please try again",
      });
    }

    // Get shipment data from session
    const shipmentData = req.session.shipmentData;

    if (!shipmentData) {
      return res.status(400).json({
        success: false,
        message: "No shipment data found. Please start over",
      });
    }

    // Create shipment in database
    const newShipment = new Shipment({
      customer: {
        name: shipmentData.customer.name,
        email: shipmentData.customer.email,
        phone: shipmentData.customer.phone,
        userId: req.user ? req.user._id : null,
      },
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      package: shipmentData.package,
      shipping: {
        carrier: shipmentData.selectedRate.carrier,
        service: shipmentData.selectedRate.service,
        estimatedDelivery: shipmentData.selectedRate.estimatedDelivery,
        rate: shipmentData.selectedRate.rate,
      },
      payment: {
        method: paymentMethod,
        status: "completed",
        transactionId: `TR${Date.now()}`,
        amount: shipmentData.selectedRate.rate.value,
        currency: shipmentData.selectedRate.rate.currency,
        paidAt: Date.now(),
      },
      statusHistory: [
        {
          status: "created",
          location: "System",
          note: "Shipment created",
        },
      ],
    });

    await newShipment.save();

    // Send confirmation email
    await sendShipmentConfirmation(shipmentData.customer.email, newShipment);

    // Clear session data
    req.session.shipmentData = null;

    res.status(200).json({
      success: true,
      message: "Shipment created successfully",
      trackingNumber: newShipment.trackingNumber,
      redirectTo: `/shipment/track/${newShipment.trackingNumber}`,
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while processing payment",
    });
  }
});

// Track shipment API
router.post("/track", async (req, res) => {
  try {
    const { trackingNumber } = req.body;

    // Find shipment by tracking number
    const shipment = await Shipment.findOne({ trackingNumber });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "No shipment found with that tracking number",
      });
    }

    res.status(200).json({
      success: true,
      shipment,
    });
  } catch (error) {
    console.error("Shipment tracking error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while tracking your shipment",
    });
  }
});

// Get user shipments (for logged in users)
router.get("/my-shipments", authenticateUser, async (req, res) => {
  try {
    const shipments = await Shipment.find({
      "customer.userId": req.user._id,
    }).sort({ createdAt: -1 });

    res.render("shipment/my-shipments", {
      title: "My Shipments",
      layout: "layouts/main",
      shipments,
    });
  } catch (error) {
    console.error("My shipments error:", error);
    res.render("shipment/my-shipments", {
      title: "My Shipments",
      layout: "layouts/main",
      error: "An error occurred while fetching your shipments",
    });
  }
});

module.exports = router;
