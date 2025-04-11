const nodemailer = require("nodemailer");

// Create a transporter based on environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send welcome email to new subscribers
const sendWelcomeEmail = async (recipient, token) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Steph Logistics Shipping" <${process.env.EMAIL_USERNAME}>`,
    to: recipient,
    subject: "Welcome to Steph Logistics Newsletter",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Welcome to Steph Logistics Newsletter!</h2>
        <p>Thank you for subscribing to our newsletter. You'll now receive updates on shipping news, promotions, and more.</p>
        <p>If you did not subscribe to our newsletter, or if you wish to unsubscribe, please click the link below:</p>
        <p><a href="${
          process.env.SITE_URL || "http://localhost:3000"
        }/newsletter/unsubscribe/${token}" style="color: #3498db;">Unsubscribe</a></p>
        <p>Best regards,<br>The Steph Logistics Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Send shipment confirmation email
const sendShipmentConfirmation = async (recipient, shipmentDetails) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Steph Logistics Shipping" <${process.env.EMAIL_USERNAME}>`,
    to: recipient,
    subject: `Shipment Confirmation - Tracking #${shipmentDetails.trackingNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Shipment Confirmation</h2>
        <p>Your shipment has been confirmed with the following details:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Tracking Number:</strong> ${
            shipmentDetails.trackingNumber
          }</p>
          <p><strong>From:</strong> ${shipmentDetails.origin.city}, ${
      shipmentDetails.origin.country
    }</p>
          <p><strong>To:</strong> ${shipmentDetails.destination.city}, ${
      shipmentDetails.destination.country
    }</p>
          <p><strong>Carrier:</strong> ${shipmentDetails.shipping.carrier}</p>
          <p><strong>Service:</strong> ${shipmentDetails.shipping.service}</p>
          <p><strong>Estimated Delivery:</strong> ${
            shipmentDetails.shipping.estimatedDelivery
              ? new Date(
                  shipmentDetails.shipping.estimatedDelivery
                ).toLocaleDateString()
              : "To be determined"
          }</p>
        </div>
        <p>You can track your shipment at any time by visiting our website and entering your tracking number.</p>
        <p>Thank you for choosing Steph Logistics for your shipping needs!</p>
        <p>Best regards,<br>The Steph Logistics Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Send contact form confirmation
const sendContactConfirmation = async (recipient, contactDetails) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Steph Logistics Shipping" <${process.env.EMAIL_USERNAME}>`,
    to: recipient,
    subject: "We Received Your Message - Steph Logistics Contact",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank You for Contacting Us</h2>
        <p>We have received your message with the following details:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Name:</strong> ${contactDetails.name}</p>
          <p><strong>Subject:</strong> ${contactDetails.subject}</p>
          <p><strong>Message:</strong> ${contactDetails.message}</p>
        </div>
        <p>Our team will review your message and get back to you as soon as possible.</p>
        <p>Best regards,<br>The Steph Logistics Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

// Send password reset email
const sendPasswordResetEmail = async (recipient, resetToken) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Steph Logistics Shipping" <${process.env.EMAIL_USERNAME}>`,
    to: recipient,
    subject: "Password Reset - Steph Logistics",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>You requested a password reset for your Steph Logistics account. Please click the link below to reset your password:</p>
        <p><a href="${
          process.env.SITE_URL || "http://localhost:3000"
        }/auth/reset-password/${resetToken}" style="color: #3498db;">Reset Password</a></p>
        <p>This link will expire in 1 hour. If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br>The Steph Logistics Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendShipmentConfirmation,
  sendContactConfirmation,
  sendPasswordResetEmail,
};
