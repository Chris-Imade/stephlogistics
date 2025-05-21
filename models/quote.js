const mongoose = require("mongoose");

const quoteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
    trim: true,
  },
  company: {
    type: String,
    trim: true,
  },
  serviceType: {
    type: String,
    required: [true, "Service type is required"],
    enum: ["domestic", "international", "ecommerce", "franchise", "other"],
  },
  origin: {
    type: String,
    required: [true, "Origin location is required"],
    trim: true,
  },
  destination: {
    type: String,
    required: [true, "Destination location is required"],
    trim: true,
  },
  weight: {
    type: String,
    required: [true, "Weight is required"],
    trim: true,
  },
  dimensions: {
    type: String,
    required: [true, "Dimensions are required"],
    trim: true,
  },
  specialRequirements: {
    type: String,
    trim: true,
  },
  message: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "in-progress", "completed", "cancelled"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
quoteSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Quote", quoteSchema);
