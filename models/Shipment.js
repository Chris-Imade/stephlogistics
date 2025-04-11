const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema({
  trackingNumber: {
    type: String,
    unique: true,
  },
  customer: {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  origin: {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  destination: {
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      trim: true,
    },
    postalCode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
  },
  package: {
    type: {
      type: String,
      enum: ["document", "package", "pallet"],
      required: true,
    },
    weight: {
      value: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["kg", "lb"],
        default: "kg",
      },
    },
    dimensions: {
      length: {
        type: Number,
        required: true,
      },
      width: {
        type: Number,
        required: true,
      },
      height: {
        type: Number,
        required: true,
      },
      unit: {
        type: String,
        enum: ["cm", "in"],
        default: "cm",
      },
    },
    isFragile: {
      type: Boolean,
      default: false,
    },
    insuranceRequired: {
      type: Boolean,
      default: false,
    },
    declaredValue: {
      value: {
        type: Number,
        default: 0,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
  },
  shipping: {
    carrier: {
      type: String,
      required: true,
      enum: ["DHL", "FedEx", "UPS"],
    },
    service: {
      type: String,
      required: true,
    },
    estimatedDelivery: {
      type: Date,
    },
    rate: {
      value: {
        type: Number,
        required: true,
      },
      currency: {
        type: String,
        default: "USD",
      },
    },
  },
  payment: {
    method: {
      type: String,
      enum: ["credit_card", "paypal", "cash"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    transactionId: String,
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    paidAt: Date,
  },
  status: {
    type: String,
    enum: ["created", "processing", "in_transit", "delivered", "cancelled"],
    default: "created",
  },
  statusHistory: [
    {
      status: {
        type: String,
        required: true,
      },
      location: String,
      timestamp: {
        type: Date,
        default: Date.now,
      },
      note: String,
    },
  ],
  labelUrl: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Generate tracking number before saving if one doesn't exist
shipmentSchema.pre("save", function (next) {
  if (!this.trackingNumber) {
    const prefix = "SL";
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.trackingNumber = `${prefix}${timestamp}${random}`;
  }
  this.updatedAt = Date.now();
  next();
});

const Shipment = mongoose.model("Shipment", shipmentSchema);

module.exports = Shipment;
