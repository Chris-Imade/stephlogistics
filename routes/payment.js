const express = require("express");
const router = express.Router();
const paymentService = require("../services/paymentService");
const Shipment = require("../models/Shipment");

// Create a payment
router.post("/create", async (req, res) => {
  try {
    const { shipmentId, provider, amount } = req.body;

    if (!shipmentId || !provider || !amount) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Find the shipment
    const shipment = await Shipment.findOne({
      $or: [{ trackingId: shipmentId }, { _id: shipmentId }],
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    if (shipment.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Shipment is already paid",
      });
    }

    // Initialize payment based on provider
    if (provider === "stripe") {
      try {
        const paymentIntent = await paymentService.initiatePayment("stripe", {
          amount: amount,
          currency: "gbp",
          shipmentId: shipment.trackingId,
          customerEmail: shipment.customerEmail,
        });

        // Update shipment with payment information
        shipment.paymentProvider = provider;
        shipment.paymentIntentId = paymentIntent.id;
        await shipment.save();

        res.json({
          success: true,
          data: {
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            amount: paymentIntent.amount,
            currency: paymentIntent.currency,
          },
        });
      } catch (error) {
        console.error("Stripe payment creation error:", error);
        res.status(500).json({
          success: false,
          message: "Error creating Stripe payment",
          error: error.message,
        });
      }
    } else if (provider === "paypal") {
      // Initialize PayPal payment
      const paymentIntent = {
        id: `PAY-${Date.now()}`,
        amount: amount,
        currency: "gbp",
      };

      // Update shipment with payment information
      shipment.paymentProvider = provider;
      shipment.paymentIntentId = paymentIntent.id;
      await shipment.save();

      res.json({
        success: true,
        data: {
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
        },
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment provider",
      });
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({
      success: false,
      message: "Error creating payment",
      error: error.message,
    });
  }
});

// Complete payment
router.post("/complete", async (req, res) => {
  try {
    const { shipmentId, provider, paymentIntentId, orderId } = req.body;

    if (!shipmentId || !provider) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const shipment = await Shipment.findOne({
      $or: [{ trackingId: shipmentId }, { _id: shipmentId }],
    });

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: "Shipment not found",
      });
    }

    if (shipment.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Shipment is already paid",
      });
    }

    // Verify payment based on provider
    if (provider === "stripe" && paymentIntentId) {
      // Verify Stripe payment
      if (paymentIntentId !== shipment.paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment intent",
        });
      }
    } else if (provider === "paypal" && orderId) {
      // Verify PayPal payment
      if (orderId !== shipment.paymentIntentId) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID",
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid payment verification",
      });
    }

    // Update shipment payment status
    shipment.paymentStatus = "Paid";
    shipment.paymentCompletedAt = new Date();
    await shipment.save();

    res.json({
      success: true,
      message: "Payment completed successfully",
      data: {
        paymentStatus: shipment.paymentStatus,
        paymentCompletedAt: shipment.paymentCompletedAt,
      },
    });
  } catch (error) {
    console.error("Error completing payment:", error);
    res.status(500).json({
      success: false,
      message: "Error completing payment",
    });
  }
});

module.exports = router;
