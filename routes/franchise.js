const express = require("express");
const router = express.Router();
const Franchise = require("../models/Franchise");
const { isAuthenticated, isAdmin } = require("../middleware/auth");
const {
  sendFranchiseConfirmation,
  sendFranchiseAdminNotification,
} = require("../config/email");
const nodemailer = require("nodemailer");

// Create reusable transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false, // true for 465, false for other ports like 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Verify connection configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.log("SMTP server connection error: ", error);
  } else {
    console.log("SMTP server connection verified successfully");
  }
});

// Main franchise page
router.get("/", (req, res) => {
  res.render("franchise/index", {
    title: "Franchise Opportunities - Steph Logistics",
    layout: "layouts/main",
    extraCSS: '<link rel="stylesheet" href="/assets/css/franchise.css">',
  });
});

// Handle franchise application form submission
router.post("/submit-application", async (req, res) => {
  try {
    console.log("Processing franchise application submission");
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      investment,
      experience,
      timeline,
    } = req.body;

    console.log("Application data received:", { firstName, lastName, email });

    // Send confirmation email to applicant
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Thank you for your franchise application",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Franchise Application Confirmation</title>
          <style type="text/css">
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
            }
            .email-header {
              background-color: #2a9d8f;
              padding: 20px;
              text-align: center;
            }
            .email-header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .email-body {
              padding: 30px;
            }
            .email-footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            h2 {
              color: #2a9d8f;
              margin-top: 0;
              font-size: 20px;
            }
            .application-summary {
              background-color: #f9f9f9;
              border-left: 4px solid #2a9d8f;
              padding: 15px;
              margin: 20px 0;
            }
            .application-summary h3 {
              margin-top: 0;
              color: #333;
              font-size: 16px;
            }
            .application-summary ul {
              list-style-type: none;
              padding-left: 0;
            }
            .application-summary li {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .application-summary li:last-child {
              border-bottom: none;
            }
            .next-steps {
              background-color: #e9f7f6;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .next-steps h3 {
              margin-top: 0;
              color: #2a9d8f;
            }
            @media only screen and (max-width: 620px) {
              .email-container {
                width: 100% !important;
              }
              .email-body {
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Steph Logistics Franchise</h1>
            </div>
            <div class="email-body">
              <h2>Thank you for your interest in Steph Logistics</h2>
              <p>Dear ${firstName} ${lastName},</p>
              <p>We are pleased to confirm that we have received your franchise application. Thank you for your interest in joining the Steph Logistics family.</p>
              
              <div class="application-summary">
                <h3>Application Summary</h3>
                <ul>
                  <li><strong>Name:</strong> ${firstName} ${lastName}</li>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Phone:</strong> ${phone}</li>
                  <li><strong>Preferred Location:</strong> ${
                    location || "Not specified"
                  }</li>
                  <li><strong>Investment Range:</strong> ${investment}</li>
                  <li><strong>Timeline:</strong> ${
                    timeline || "Not specified"
                  }</li>
                </ul>
              </div>
              
              <div class="next-steps">
                <h3>What Happens Next?</h3>
                <p>Our franchise team will review your application carefully and contact you within 48 hours to discuss the next steps in the process. Please ensure that the phone number you provided is accessible during business hours.</p>
              </div>
              
              <p>If you have any immediate questions or need to update any information on your application, please don't hesitate to contact our franchise team directly.</p>
              
              <p>We look forward to discussing this exciting opportunity with you soon.</p>
              
              <p>Best regards,<br>The Steph Logistics Franchise Team</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} Steph Logistics Ltd. All rights reserved.</p>
              <p>This email was sent to ${email} regarding your franchise application.</p>
              <p>Steph Logistics Ltd., Registered in the UK.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent to applicant");

    // Send notification to franchise team
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.FRANCHISE_TEAM_EMAIL,
      subject: "New Franchise Application Received",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Franchise Application</title>
          <style type="text/css">
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
            }
            .email-header {
              background-color: #264653;
              padding: 20px;
              text-align: center;
            }
            .email-header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .email-body {
              padding: 30px;
            }
            .email-footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            h2 {
              color: #264653;
              margin-top: 0;
              font-size: 20px;
            }
            .alert-new {
              background-color: #e76f51;
              color: white;
              padding: 10px 15px;
              border-radius: 4px;
              display: inline-block;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .applicant-details {
              background-color: #f9f9f9;
              border-left: 4px solid #264653;
              padding: 15px;
              margin: 20px 0;
            }
            .applicant-details h3 {
              margin-top: 0;
              color: #333;
              font-size: 16px;
            }
            .applicant-details ul {
              list-style-type: none;
              padding-left: 0;
            }
            .applicant-details li {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .applicant-details li:last-child {
              border-bottom: none;
            }
            .action-button {
              background-color: #2a9d8f;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            @media only screen and (max-width: 620px) {
              .email-container {
                width: 100% !important;
              }
              .email-body {
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Franchise Application Alert</h1>
            </div>
            <div class="email-body">
              <div class="alert-new">New Application</div>
              
              <h2>New Franchise Application Received</h2>
              <p>A new franchise application has been submitted through the website. Please review the details below and contact the applicant within the next 48 hours.</p>
              
              <div class="applicant-details">
                <h3>Applicant Information</h3>
                <ul>
                  <li><strong>Name:</strong> ${firstName} ${lastName}</li>
                  <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
                  <li><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></li>
                  <li><strong>Preferred Location:</strong> ${
                    location || "Not specified"
                  }</li>
                  <li><strong>Investment Range:</strong> ${investment}</li>
                  <li><strong>Experience:</strong> ${
                    experience || "Not specified"
                  }</li>
                  <li><strong>Timeline:</strong> ${
                    timeline || "Not specified"
                  }</li>
                  <li><strong>Application Date:</strong> ${new Date().toLocaleString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</li>
                </ul>
              </div>
              
              <p>Please update the CRM with this application and assign a franchise advisor to follow up with the applicant.</p>
              
              <a href="http://www.stephlogistics.co.uk/admin/franchise/applications" class="action-button">View in Admin Portal</a>
              
              <p>This is an automated notification.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} Steph Logistics Ltd. All rights reserved.</p>
              <p>Internal communication for franchise team only.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Notification email sent to franchise team");
    res.json({ success: true, message: "Application submitted successfully" });
  } catch (error) {
    console.error("Error submitting application:", error);
    res
      .status(500)
      .json({ success: false, message: "Error submitting application" });
  }
});

// Handle contact form submission
router.post("/submit-contact", async (req, res) => {
  try {
    console.log("Processing contact form submission");
    const { name, email, phone, message } = req.body;

    console.log("Contact data received:", { name, email });

    // Send confirmation email to the person who submitted the form
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: "Thank you for contacting Steph Logistics Franchise",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Confirmation</title>
          <style type="text/css">
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
            }
            .email-header {
              background-color: #2a9d8f;
              padding: 20px;
              text-align: center;
            }
            .email-header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .email-body {
              padding: 30px;
            }
            .email-footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            h2 {
              color: #2a9d8f;
              margin-top: 0;
              font-size: 20px;
            }
            .message-box {
              background-color: #f9f9f9;
              border-left: 4px solid #2a9d8f;
              padding: 15px;
              margin: 20px 0;
            }
            .message-box h3 {
              margin-top: 0;
              color: #333;
              font-size: 16px;
            }
            .response-time {
              background-color: #e9f7f6;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .response-time h3 {
              margin-top: 0;
              color: #2a9d8f;
            }
            @media only screen and (max-width: 620px) {
              .email-container {
                width: 100% !important;
              }
              .email-body {
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Steph Logistics Franchise</h1>
            </div>
            <div class="email-body">
              <h2>Thank you for your inquiry</h2>
              <p>Dear ${name},</p>
              <p>Thank you for contacting the Steph Logistics Franchise team. We have received your message and appreciate your interest in our franchise opportunity.</p>
              
              <div class="message-box">
                <h3>Your Message</h3>
                <p>${message}</p>
              </div>
              
              <div class="response-time">
                <h3>What Happens Next?</h3>
                <p>A member of our franchise team will review your inquiry and contact you within 24 hours. We value your interest and look forward to discussing our franchise opportunities with you.</p>
              </div>
              
              <p>If you have any urgent questions in the meantime, please feel free to call our franchise team directly.</p>
              
              <p>Best regards,<br>The Steph Logistics Franchise Team</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} Steph Logistics Ltd. All rights reserved.</p>
              <p>This email was sent to ${email} regarding your franchise inquiry.</p>
              <p>Steph Logistics Ltd., Registered in the UK.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Confirmation email sent to contact");

    // Send notification to franchise team
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.FRANCHISE_TEAM_EMAIL,
      subject: "New Franchise Inquiry",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Franchise Inquiry</title>
          <style type="text/css">
            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f9f9f9;
            }
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              border-radius: 5px;
              overflow: hidden;
            }
            .email-header {
              background-color: #264653;
              padding: 20px;
              text-align: center;
            }
            .email-header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .email-body {
              padding: 30px;
            }
            .email-footer {
              background-color: #f5f5f5;
              padding: 20px;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            h2 {
              color: #264653;
              margin-top: 0;
              font-size: 20px;
            }
            .alert-new {
              background-color: #e76f51;
              color: white;
              padding: 10px 15px;
              border-radius: 4px;
              display: inline-block;
              font-weight: bold;
              margin-bottom: 20px;
            }
            .inquirer-details {
              background-color: #f9f9f9;
              border-left: 4px solid #264653;
              padding: 15px;
              margin: 20px 0;
            }
            .inquirer-details h3 {
              margin-top: 0;
              color: #333;
              font-size: 16px;
            }
            .inquirer-details ul {
              list-style-type: none;
              padding-left: 0;
            }
            .inquirer-details li {
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .inquirer-details li:last-child {
              border-bottom: none;
            }
            .message-content {
              background-color: #f5f5f5;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
            }
            .message-content h3 {
              margin-top: 0;
              color: #264653;
              font-size: 16px;
            }
            .action-button {
              background-color: #2a9d8f;
              color: white;
              padding: 12px 20px;
              text-decoration: none;
              border-radius: 4px;
              display: inline-block;
              margin: 20px 0;
              font-weight: bold;
            }
            @media only screen and (max-width: 620px) {
              .email-container {
                width: 100% !important;
              }
              .email-body {
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="email-header">
              <h1>Franchise Inquiry Alert</h1>
            </div>
            <div class="email-body">
              <div class="alert-new">New Inquiry</div>
              
              <h2>New Franchise Inquiry Received</h2>
              <p>A new inquiry about the franchise opportunity has been submitted through the website. Please review the details below and contact the individual within the next 24 hours.</p>
              
              <div class="inquirer-details">
                <h3>Contact Information</h3>
                <ul>
                  <li><strong>Name:</strong> ${name}</li>
                  <li><strong>Email:</strong> <a href="mailto:${email}">${email}</a></li>
                  <li><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></li>
                  <li><strong>Submission Time:</strong> ${new Date().toLocaleString(
                    "en-GB",
                    {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  )}</li>
                </ul>
              </div>
              
              <div class="message-content">
                <h3>Message Content</h3>
                <p>${message}</p>
              </div>
              
              <p>Please update the CRM with this inquiry and assign a franchise advisor to follow up.</p>
              
              <a href="http://www.stephlogistics.co.uk/admin/franchise/inquiries" class="action-button">View in Admin Portal</a>
              
              <p>This is an automated notification.</p>
            </div>
            <div class="email-footer">
              <p>&copy; ${new Date().getFullYear()} Steph Logistics Ltd. All rights reserved.</p>
              <p>Internal communication for franchise team only.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Notification email sent to franchise team");
    res.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Error sending message" });
  }
});

// Franchise application form submission
router.post("/apply", async (req, res) => {
  try {
    // Extract data from req.body
    const {
      firstName,
      lastName,
      email,
      phone,
      location,
      investment,
      experience,
      timeline,
    } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !investment) {
      return res.status(400).json({
        success: false,
        message: "Please provide all required information",
      });
    }

    // Map investment values to match the enum values in the Franchise model
    let investmentCapability;
    switch (investment) {
      case "50000-75000":
        investmentCapability = "$50k-$100k";
        break;
      case "75000-100000":
        investmentCapability = "$100k-$150k";
        break;
      case "100000+":
        investmentCapability = "$150k-$200k";
        break;
      default:
        investmentCapability = "$50k-$100k";
    }

    // Create applicant data
    const applicantData = {
      applicantName: `${firstName} ${lastName}`,
      email,
      phone,
      address: {
        street: "N/A", // Default value to pass validation
        city: "N/A", // Default value to pass validation
        state: "N/A", // Default value to pass validation
        postalCode: "N/A", // Default value to pass validation
        country: "N/A", // Default value to pass validation
      },
      businessExperience: experience || "",
      investmentCapability,
      preferredLocation: location || "",
      applicationStatus: "pending",
      comments: `Timeline: ${timeline || "Not specified"}`,
    };

    // Save to database
    const application = new Franchise(applicantData);
    await application.save();

    // Send confirmation email to applicant
    const applicantDetails = {
      firstName,
      lastName,
      email,
      phone,
      location,
      investment,
      experience,
      timeline,
    };

    try {
      await sendFranchiseConfirmation(email, applicantDetails);
    } catch (emailError) {
      console.error(
        "Failed to send confirmation email to applicant:",
        emailError
      );
      // Continue with the process even if email sending fails
    }

    // Send notification to admin
    try {
      await sendFranchiseAdminNotification(applicantDetails);
    } catch (emailError) {
      console.error("Failed to send notification email to admin:", emailError);
      // Continue with the process even if email sending fails
    }

    // Send success response
    res.json({
      success: true,
      message:
        "Your franchise application has been received. We will contact you shortly.",
    });
  } catch (error) {
    console.error("Franchise application submission error:", error);
    res.status(500).json({
      success: false,
      message:
        "An error occurred while submitting your application. Please try again or contact us directly.",
    });
  }
});

// Franchise opportunity details
router.get("/opportunity-details", (req, res) => {
  res.render("franchise/details", {
    title: "Franchise Details - Steph Logistics",
    layout: "layouts/main",
    extraCSS: '<link rel="stylesheet" href="/assets/css/franchise.css">',
  });
});

// Franchise success stories
router.get("/success-stories", (req, res) => {
  res.render("franchise/success-stories", {
    title: "Franchise Success Stories - Steph Logistics",
    layout: "layouts/main",
    extraCSS: '<link rel="stylesheet" href="/assets/css/franchise.css">',
  });
});

// Admin: List franchise applications (API)
router.get(
  "/admin/applications",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      // Build query based on status filter
      const query = {};
      if (status && status !== "all") {
        query.applicationStatus = status;
      }

      // Count total applications
      const total = await Franchise.countDocuments(query);

      // Get applications with pagination
      const applications = await Franchise.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      res.status(200).json({
        success: true,
        applications,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("Franchise applications list error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching franchise applications",
      });
    }
  }
);

// Admin: Get single franchise application (API)
router.get(
  "/admin/application/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find application by ID
      const application = await Franchise.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Franchise application not found",
        });
      }

      res.status(200).json({
        success: true,
        application,
      });
    } catch (error) {
      console.error("Franchise application detail error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching franchise application",
      });
    }
  }
);

// Admin: Update franchise application status (API)
router.patch(
  "/admin/application/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { applicationStatus, comments } = req.body;

      // Find and update application
      const application = await Franchise.findById(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Franchise application not found",
        });
      }

      // Update fields
      application.applicationStatus =
        applicationStatus || application.applicationStatus;

      if (comments) {
        application.comments = comments;
      }

      await application.save();

      res.status(200).json({
        success: true,
        message: "Franchise application updated successfully",
        application,
      });
    } catch (error) {
      console.error("Franchise application update error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating franchise application",
      });
    }
  }
);

// Admin: Delete franchise application (API)
router.delete(
  "/admin/application/:id",
  isAuthenticated,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find and delete application
      const application = await Franchise.findByIdAndDelete(id);

      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Franchise application not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Franchise application deleted successfully",
      });
    } catch (error) {
      console.error("Franchise application delete error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting franchise application",
      });
    }
  }
);

module.exports = router;
