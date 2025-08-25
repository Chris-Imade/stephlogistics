const Contact = require("../models/Contact");
const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === "true" ? true : false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add timeout settings to give more time for connection
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
  // Add debug option for easier troubleshooting
  debug: process.env.NODE_ENV !== "production",
  logger: process.env.NODE_ENV !== "production",
});

// Verify SMTP connection on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send emails");
  }
});

// Improved user receipt email template
const userReceiptTemplate = (name, subject) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Steph Logistics</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 5px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .header { background-color: #2a9d8f; color: white; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; color: #444; }
        .content p { margin-bottom: 15px; font-size: 16px; }
        .contact-info { background-color: #f0f7f6; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .contact-info p { margin: 8px 0; font-size: 15px; }
        .footer { text-align: center; padding: 20px; background-color: #f0f0f0; font-size: 14px; color: #666; }
        .logo { max-width: 150px; margin-bottom: 15px; }
        .button { display: inline-block; background-color: #2a9d8f; color: white; text-decoration: none; padding: 12px 25px; border-radius: 4px; margin: 15px 0; font-weight: bold; }
        .reference { color: #777; font-size: 14px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Thank You for Contacting Us</h1>
        </div>
        <div class="content">
            <p>Dear <strong>${name}</strong>,</p>
            
            <p>Thank you for reaching out to Steph Logistics regarding <strong>"${subject}"</strong>. We have received your message and appreciate your interest in our services.</p>
            
            <p>Your inquiry is important to us. One of our team members will review your message and get back to you as soon as possible, typically within 24 business hours.</p>
            
            <div class="contact-info">
                <p><strong>Need immediate assistance?</strong></p>
                <p>Phone: +44 7404 888 952</p>
                <p>Email: contact@steplogistics.co.uk</p>
                <p>Business Hours: 24/7 Service</p>
            </div>
            
            <p>We look forward to assisting you with your logistics needs.</p>
            
            <p class="reference">Reference: #${Date.now()
              .toString()
              .slice(-8)}</p>
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Steph Logistics. All rights reserved.</p>
            <p>20 Ullswater Close, Northampton, NN3 2DJ, United Kingdom</p>
        </div>
    </div>
</body>
</html>
`;

// Improved admin notification template
const adminNotificationTemplate = (formData) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Form Submission</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 5px; overflow: hidden; box-shadow: 0 3px 10px rgba(0,0,0,0.1); }
        .header { background-color: #2a9d8f; color: white; padding: 25px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
        .content { padding: 30px; color: #444; }
        .content p { margin-bottom: 15px; font-size: 16px; }
        .form-data { background-color: #f0f7f6; padding: 20px; margin: 15px 0; border-radius: 5px; border-left: 4px solid #2a9d8f; }
        .form-data p { margin: 10px 0; font-size: 15px; }
        .form-data .message { background-color: white; padding: 15px; border-radius: 4px; margin-top: 10px; }
        .footer { text-align: center; padding: 20px; background-color: #f0f0f0; font-size: 14px; color: #666; }
        .timestamp { color: #888; font-size: 14px; font-style: italic; text-align: right; margin-top: 15px; }
        .action-required { background-color: #ffebee; padding: 10px; border-radius: 4px; margin: 15px 0; font-weight: bold; color: #c62828; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Website Contact Form Submission</h1>
        </div>
        <div class="content">
            <p>A new contact form submission has been received from the Steph Logistics website:</p>
            
            <div class="form-data">
                <p><strong>Name:</strong> ${formData.name}</p>
                <p><strong>Email:</strong> <a href="mailto:${formData.email}">${
  formData.email
}</a></p>
                <p><strong>Phone:</strong> <a href="tel:${formData.phone}">${
  formData.phone
}</a></p>
                <p><strong>Subject:</strong> ${formData.subject}</p>
                <p><strong>Message:</strong></p>
                <div class="message">${formData.message.replace(
                  /\n/g,
                  "<br>"
                )}</div>
                
                <div class="timestamp">
                    Submitted: ${new Date().toLocaleString("en-GB", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                </div>
            </div>
            
            <div class="action-required">
                Please respond to this inquiry within 24 hours.
            </div>
        </div>
        <div class="footer">
            <p>This is an automated message from the Steph Logistics website contact form.</p>
            <p>Reference ID: CON-${Date.now().toString().slice(-6)}</p>
        </div>
    </div>
</body>
</html>
`;

exports.getContactPage = (req, res) => {
  res.render("contact/index", {
    title: "Contact Us - Steph Logistics",
    layout: "layouts/main",
  });
};

exports.submitContactForm = async (req, res) => {
  try {
    console.log("Contact form submission received:", req.body);
    const { name, email, phone, subject, message } = req.body;

    // Check if the request is expecting JSON (AJAX)
    const isAjax = req.xhr || req.headers.accept?.indexOf("json") > -1;

    // Validate input
    if (!name || !email || !phone || !subject || !message) {
      console.log("Form validation failed - missing fields");
      if (isAjax) {
        return res.status(400).json({
          success: false,
          message: "Please fill in all required fields",
        });
      } else {
        return res.render("contact/index", {
          title: "Contact Us - Steph Logistics",
          layout: "layouts/main",
          successMessage: null,
          errorMessage: "Please fill in all required fields",
          formData: req.body,
        });
      }
    }

    // Create new contact
    const contact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    // Save to database
    console.log("Saving contact to database...");
    await contact.save();
    console.log("Contact saved successfully with ID:", contact._id);

    let emailSuccess = true;
    try {
      console.log("Sending email confirmations...");

      // Send receipt to user
      const userMailInfo = await transporter.sendMail({
        from: `"Steph Logistics" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Thank You for Contacting Steph Logistics",
        html: userReceiptTemplate(name, subject),
      });
      console.log("User confirmation email sent:", userMailInfo.messageId);

      // Send notification to admin
      const adminMailInfo = await transporter.sendMail({
        from: `"Steph Logistics Contact Form" <${process.env.SMTP_USER}>`,
        to: "contact@steplogistics.co.uk",
        subject: `New Contact Form: ${subject}`,
        html: adminNotificationTemplate({
          name,
          email,
          phone,
          subject,
          message,
        }),
      });
      console.log("Admin notification email sent:", adminMailInfo.messageId);
    } catch (emailError) {
      emailSuccess = false;
      console.error("Error sending email:", emailError);
      // Continue processing even if email fails
      // Don't throw the error here, just log it and continue
    }

    if (isAjax) {
      return res.status(200).json({
        success: true,
        emailSent: emailSuccess,
        message:
          "Your message has been sent successfully! We will contact you soon.",
      });
    } else {
      // Render contact page with success message
      return res.render("contact/index", {
        title: "Contact Us - Steph Logistics",
        layout: "layouts/main",
        successMessage:
          "Your message has been sent successfully! We will contact you soon.",
        errorMessage: null,
        formData: {},
      });
    }
  } catch (error) {
    console.error("Error submitting contact form:", error);

    // Check if the request is expecting JSON (AJAX)
    const isAjax = req.xhr || req.headers.accept?.indexOf("json") > -1;

    if (isAjax) {
      return res.status(500).json({
        success: false,
        message:
          "An error occurred while sending your message. Please try again.",
      });
    } else {
      return res.render("contact/index", {
        title: "Contact Us - Steph Logistics",
        layout: "layouts/main",
        successMessage: null,
        errorMessage:
          "An error occurred while sending your message. Please try again.",
        formData: req.body,
      });
    }
  }
};
