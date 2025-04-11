const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Generate JWT for authentication
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "jwt_secret", {
    expiresIn: "24h",
  });
};

// Generate random token for password reset
const generateResetToken = () => {
  return crypto.randomBytes(20).toString("hex");
};

// Generate tracking number for shipments
const generateTrackingNumber = () => {
  const prefix = "SL";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return `${prefix}${timestamp}${random}`;
};

module.exports = {
  generateToken,
  generateResetToken,
  generateTrackingNumber,
};
