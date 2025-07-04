const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  trackingId: {
    type: String,
    required: true,
    unique: true,
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  customerEmail: {
    type: String,
    required: true,
  },
  customerPhone: {
    type: String,
    required: true,
  },
  origin: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  shipmentDate: {
    type: Date,
    default: Date.now,
  },
  estimatedDelivery: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "In Transit", "Delivered", "Delayed", "Cancelled"],
    default: "Pending",
  },
  statusHistory: [
    {
      status: String,
      location: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      note: String,
    },
  ],
  weight: {
    type: Number,
    required: true,
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
  },
  packageType: {
    type: String,
    enum: ["Document", "Parcel", "Freight", "Express"],
    required: true,
  },
  fragile: {
    type: Boolean,
    default: false,
  },
  insuranceIncluded: {
    type: Boolean,
    default: false,
  },
  expressDelivery: {
    type: Boolean,
    default: false,
  },
  additionalNotes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  // New fields for e-commerce shipping platform
  carrier: {
    type: String,
    enum: ["DHL", "FedEx", "UPS", "USPS", "Other"],
  },
  carrierServiceLevel: String,
  carrierTrackingId: String,
  shippingCost: {
    amount: Number,
    currency: {
      type: String,
      default: "USD",
    },
  },
  shippingRates: [
    {
      carrier: String,
      serviceLevel: String,
      cost: Number,
      estimatedDays: Number,
      selected: {
        type: Boolean,
        default: false,
      },
    },
  ],
  paymentStatus: {
    type: String,
    enum: ["Unpaid", "Paid", "Refunded", "Failed", "Processing"],
    default: "Unpaid",
  },
  paymentMethod: String,
  paymentId: String,
  paymentIntentId: String,
  paymentProvider: String,
  paymentCompletedAt: Date,
  invoiceId: String,
  shippingCostCalculated: {
    baseAmount: Number,
    vatAmount: Number,
    totalAmount: Number,
    currency: {
      type: String,
      default: "GBP",
    },
  },
});

// Generate tracking ID pre-save
shipmentSchema.pre("validate", async function (next) {
  if (!this.isNew) {
    this.updatedAt = new Date();
    return next();
  }

  try {
    // If trackingId is already set manually (e.g. by admin), use it
    if (this.trackingId) {
      // Still need to check for uniqueness even if set manually
      const Shipment = mongoose.model("Shipment");
      const existingWithId = await Shipment.findOne({
        trackingId: this.trackingId,
      });

      if (existingWithId && !existingWithId._id.equals(this._id)) {
        throw new Error(
          `Tracking ID ${this.trackingId} already exists. Please use a different ID.`
        );
      }
      return next();
    }

    // Generate a unique tracking ID with format SP123456ABC
    const Shipment = mongoose.model("Shipment");
    let isUnique = false;
    let candidate = "";
    let attempts = 0;
    const maxAttempts = 5;

    // Keep trying until we get a unique ID or max attempts reached
    while (!isUnique && attempts < maxAttempts) {
      // Get today's date in format MMDD (e.g., 0926 for September 26)
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateStr = month + day;

      // Generate a 2-digit serial number, padded with zeros
      const serialNum = String(Math.floor(Math.random() * 99) + 1).padStart(
        2,
        "0"
      );

      // Generate random characters (3 chars, uppercase)
      const randomChars = Math.random()
        .toString(36)
        .substring(2, 5)
        .toUpperCase();

      // Format: SP + date + serial + random (e.g. SP092622UUT)
      candidate = `SP${dateStr}${serialNum}${randomChars}`;

      // Check if this ID already exists
      const existingShipment = await Shipment.findOne({
        trackingId: candidate,
      });

      if (!existingShipment) {
        isUnique = true;
      } else {
        attempts++;
        // Add small delay to ensure timestamp changes
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
    }

    // If we couldn't generate a unique ID after max attempts, add more random data
    if (!isUnique) {
      // Get today's date
      const today = new Date();
      const month = String(today.getMonth() + 1).padStart(2, "0");
      const day = String(today.getDate()).padStart(2, "0");
      const dateStr = month + day;

      // Add year component for extra uniqueness
      const year = String(today.getFullYear()).slice(-2);

      // Generate a 3-digit serial number
      const serialNum = String(Math.floor(Math.random() * 999) + 1).padStart(
        3,
        "0"
      );

      // Generate more random characters (4 chars)
      const extraRandom = Math.random()
        .toString(36)
        .substring(2, 6)
        .toUpperCase();

      candidate = `SP${dateStr}${year}${serialNum}${extraRandom}`;

      // Check one more time
      const existingShipment = await Shipment.findOne({
        trackingId: candidate,
      });
      if (existingShipment) {
        throw new Error(
          "Could not generate a unique tracking ID after multiple attempts"
        );
      }
    }

    this.trackingId = candidate;
    // Set trackingNumber to match trackingId
    this.trackingNumber = candidate;
    this.updatedAt = new Date();
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Shipment", shipmentSchema);
