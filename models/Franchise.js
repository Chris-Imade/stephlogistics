const mongoose = require("mongoose");

const franchiseSchema = new mongoose.Schema({
  applicantName: {
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
  address: {
    street: {
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
      required: true,
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
  businessExperience: {
    type: String,
    trim: true,
  },
  investmentCapability: {
    type: String,
    required: true,
    enum: ["$50k-$100k", "$100k-$150k", "$150k-$200k", "$200k+"],
  },
  preferredLocation: {
    type: String,
    trim: true,
  },
  applicationStatus: {
    type: String,
    enum: ["pending", "reviewing", "approved", "rejected"],
    default: "pending",
  },
  comments: {
    type: String,
    trim: true,
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

// Update timestamp before saving
franchiseSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

const Franchise = mongoose.model("Franchise", franchiseSchema);

module.exports = Franchise;
