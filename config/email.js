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

// Send franchise information pack confirmation to applicant
const sendFranchiseConfirmation = async (recipient, applicantDetails) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Steph Logistics Franchise" <${process.env.EMAIL_USERNAME}>`,
    to: recipient,
    subject: "Your Steph Logistics Franchise Information Pack",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2a9d8f;">Thank You for Your Interest in Steph Logistics Franchise</h2>
        <p>Dear ${applicantDetails.firstName},</p>
        <p>Thank you for your interest in becoming a Steph Logistics franchise partner. We're excited about the possibility of welcoming you to our growing family of successful franchise owners.</p>
        <p>Your information pack request has been received and is being processed. You will receive a comprehensive information pack within the next 24-48 hours.</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Next Steps:</strong></p>
          <ol>
            <li>Review the information pack that will be sent to you shortly</li>
            <li>Schedule a discovery call with our franchise development team</li>
            <li>Complete our full application process</li>
          </ol>
        </div>
        <p>If you have any immediate questions, please feel free to contact our franchise team at <a href="mailto:franchise@stephlogistics.co.uk" style="color: #2a9d8f;">franchise@stephlogistics.co.uk</a> or call us at +44 7404 888 952.</p>
        <p>We look forward to discussing this exciting opportunity with you further!</p>
        <p>Best regards,<br>The Steph Logistics Franchise Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Franchise confirmation email sending failed:", error);
    return false;
  }
};

// Send franchise application notification to admin
const sendFranchiseAdminNotification = async (applicantDetails) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Steph Logistics Franchise System" <${process.env.EMAIL_USERNAME}>`,
    to: "info@stephlogistics.co.uk",
    subject: `New Franchise Information Request - ${applicantDetails.firstName} ${applicantDetails.lastName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #264653;">New Franchise Information Request</h2>
        <p>A new franchise information request has been submitted with the following details:</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Name:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${
                applicantDetails.firstName
              } ${applicantDetails.lastName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Email:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><a href="mailto:${
                applicantDetails.email
              }" style="color: #2a9d8f;">${applicantDetails.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Phone:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${
                applicantDetails.phone
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Location:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${
                applicantDetails.location || "Not specified"
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Investment:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">£${
                applicantDetails.investment
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Experience:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${
                applicantDetails.experience || "Not specified"
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;"><strong>Timeline:</strong></td>
              <td style="padding: 8px 0; border-bottom: 1px solid #ddd;">${
                applicantDetails.timeline || "Not specified"
              }</td>
            </tr>
            <tr>
              <td style="padding: 8px 0;"><strong>Date Submitted:</strong></td>
              <td style="padding: 8px 0;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
        </div>
        <p>Please follow up with this applicant within 24 hours and send the franchise information pack.</p>
        <p><a href="${
          process.env.SITE_URL || "http://localhost:3000"
        }/admin/franchise/applications" style="display: inline-block; background-color: #2a9d8f; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View in Admin Portal</a></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Franchise admin notification email sending failed:", error);
    return false;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendShipmentConfirmation,
  sendContactConfirmation,
  sendPasswordResetEmail,
  sendFranchiseConfirmation,
  sendFranchiseAdminNotification,
};
