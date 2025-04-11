const mongoose = require("mongoose");

const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  name: {
    type: String,
    trim: true,
  },
  isSubscribed: {
    type: Boolean,
    default: true,
  },
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
  unsubscribedAt: {
    type: Date,
  },
  token: {
    type: String,
  },
});

// Generate a unique token for unsubscribe functionality
newsletterSchema.pre("save", function (next) {
  if (!this.token) {
    this.token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  next();
});

const Newsletter = mongoose.model("Newsletter", newsletterSchema);

module.exports = Newsletter;
