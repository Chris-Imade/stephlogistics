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
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="text-align: center; margin-bottom: 25px;">
          <img src="https://stephlogistics.co.uk/assets/images/logo/logo.png" alt="Steph Logistics" style="max-width: 200px;">
        </div>
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 25px; border-left: 4px solid #2a9d8f;">
          <h2 style="color: #2a9d8f; margin-top: 0;">Welcome to Our Newsletter!</h2>
          <p style="font-size: 16px; line-height: 1.5;">Thank you for subscribing to the Steph Logistics newsletter. You'll now receive updates on:</p>
          <ul style="font-size: 16px; line-height: 1.5;">
            <li>Latest shipping solutions</li>
            <li>Industry news and trends</li>
            <li>Exclusive promotions and offers</li>
            <li>Service updates and improvements</li>
          </ul>
          <p style="font-size: 16px; line-height: 1.5;">We're excited to have you join our community and look forward to serving your logistics needs.</p>
        </div>
        <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #eee; font-size: 14px; color: #666; text-align: center;">
          <p>© ${new Date().getFullYear()} Steph Logistics. All rights reserved.</p>
          <p>20 Ullswater Close, Northampton, NN3 2DJ, United Kingdom</p>
        </div>
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
    to: "contact@steplogistics.co.uk",
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

// Send quote notification to admin
async function sendQuoteAdminNotification(data) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: "support@stephlogistics.co.uk",
    subject: `New Quote Request - ${data.serviceType} - ${data.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://stephlogistics.co.uk/assets/images/logo/logo.png" alt="Steph Logistics" style="max-width: 200px;">
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #2A9D8F;">
          <h2 style="color: #2A9D8F; margin-bottom: 20px; border-bottom: 2px solid #2A9D8F; padding-bottom: 10px;">New Quote Request Details</h2>
          
          <div style="margin: 20px 0; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Customer Information</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.name
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${
                  data.email
                }" style="color: #2A9D8F;">${data.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Phone:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="tel:${
                  data.phone
                }" style="color: #2A9D8F;">${data.phone}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Company:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.company || "N/A"
                }</td>
              </tr>
            </table>
          </div>

          <div style="margin: 20px 0; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="color: #333; margin-bottom: 15px; font-size: 18px;">Quote Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Service Type:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.serviceType
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Origin:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.origin
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Destination:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.destination
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Weight:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.weight
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Dimensions:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.dimensions
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Special Requirements:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.specialRequirements || "None"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Additional Message:</strong></td>
                <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${
                  data.message || "None"
                }</td>
              </tr>
              <tr>
                <td style="padding: 8px 0;"><strong>Quote ID:</strong></td>
                <td style="padding: 8px 0;">${data.quoteId}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.BASE_URL}/admin/quotes/${data.quoteId}" 
               style="display: inline-block; padding: 12px 25px; background-color: #2A9D8F; color: #fff; text-decoration: none; border-radius: 5px; font-weight: 600;">
              View Quote Details
            </a>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>© ${new Date().getFullYear()} Steph Logistics. All rights reserved.</p>
          <p>20 Ullswater Close, Northampton, NN3 2DJ, United Kingdom</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

// Send quote confirmation email to customer
async function sendQuoteConfirmation(email, data) {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Quote Request Received - Steph Logistics",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://stephlogistics.co.uk/assets/images/logo/logo.png" alt="Steph Logistics" style="max-width: 200px;">
        </div>
        <div style="background-color: #f8f9fa; padding: 30px; border-radius: 10px; border-left: 4px solid #2A9D8F;">
          <h2 style="color: #2A9D8F; margin-bottom: 20px;">Thank You for Your Quote Request</h2>
          <p style="color: #666; line-height: 1.6;">Dear ${data.name},</p>
          <p style="color: #666; line-height: 1.6;">We have received your quote request for ${
            data.serviceType
          } services. Our team will review your requirements and get back to you within 24 hours.</p>
          
          <div style="margin: 30px 0; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="color: #333; margin-bottom: 15px;">Your Quote Details</h3>
            <p style="margin: 5px 0;"><strong>Service Type:</strong> ${
              data.serviceType
            }</p>
            <p style="margin: 5px 0;"><strong>Quote Reference:</strong> ${
              data.quoteId
            }</p>
          </div>

          <div style="margin: 30px 0; padding: 20px; background-color: #fff; border-radius: 5px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
            <h3 style="color: #333; margin-bottom: 15px;">What's Next?</h3>
            <ul style="color: #666; line-height: 1.6; padding-left: 20px;">
              <li>Our team will review your requirements</li>
              <li>We'll prepare a detailed quote for your needs</li>
              <li>You'll receive our response within 24 hours</li>
            </ul>
          </div>

          <p style="color: #666; line-height: 1.6;">If you have any questions, please don't hesitate to contact us:</p>
          <div style="margin: 20px 0; padding: 15px; background-color: #fff; border-radius: 5px; text-align: center;">
            <p style="margin: 5px 0;">
              <a href="mailto:contact@stephlogistics.co.uk" style="color: #2A9D8F; text-decoration: none;">
                <i class="fa-regular fa-envelope"></i> contact@stephlogistics.co.uk
              </a>
            </p>
            <p style="margin: 5px 0;">
              <a href="tel:+447404888952" style="color: #2A9D8F; text-decoration: none;">
                <i class="fa-regular fa-phone"></i> +44 7404 888 952
              </a>
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
          <p>© ${new Date().getFullYear()} Steph Logistics. All rights reserved.</p>
          <p>20 Ullswater Close, Northampton, NN3 2DJ, United Kingdom</p>
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
}

module.exports = {
  sendWelcomeEmail,
  sendShipmentConfirmation,
  sendContactConfirmation,
  sendPasswordResetEmail,
  sendFranchiseConfirmation,
  sendFranchiseAdminNotification,
  sendQuoteConfirmation,
  sendQuoteAdminNotification,
};
