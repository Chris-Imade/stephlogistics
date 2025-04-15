const Shipment = require("../models/Shipment");
const nodemailer = require("nodemailer");

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  // Add timeout settings to give more time for connection
  connectionTimeout: 60000, // 60 seconds
  greetingTimeout: 30000, // 30 seconds
  socketTimeout: 60000, // 60 seconds
});

// Email templates
const customerShipmentConfirmationTemplate = (shipment) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1a237e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; background-color: #f5f5f5; }
        .shipment-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .tracking-number { font-size: 18px; font-weight: bold; color: #1a237e; }
        .button { display: inline-block; background-color: #1a237e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Your Shipment is Confirmed!</h1>
        </div>
        <div class="content">
            <p>Dear ${shipment.customerName},</p>
            <p>Thank you for choosing Steph Logistics for your shipping needs. Your shipment has been confirmed and is now being processed.</p>
            
            <div class="shipment-details">
                <p><strong>Tracking Number:</strong> <span class="tracking-number">${
                  shipment.trackingId
                }</span></p>
                <p><strong>Origin:</strong> ${shipment.origin}</p>
                <p><strong>Destination:</strong> ${shipment.destination}</p>
                <p><strong>Package Type:</strong> ${shipment.packageType}</p>
                <p><strong>Weight:</strong> ${shipment.weight} kg</p>
                <p><strong>Estimated Delivery:</strong> ${new Date(
                  shipment.estimatedDelivery
                ).toDateString()}</p>
                <p><strong>Status:</strong> ${shipment.status}</p>
            </div>
            
            <p>You can track your shipment at any time by visiting our website and entering your tracking number.</p>
            
            <a href="https://www.stephlogistics.co.uk/shipment/track?id=${
              shipment.trackingId
            }" class="button">Track Shipment</a>
            
            <p>If you have any questions about your shipment, please contact our customer service team at support@stephlogistics.co.uk or call +44 7506 323070.</p>
        </div>
        <div class="footer">
            <p>Best regards,<br>The Steph Logistics Team</p>
        </div>
    </div>
</body>
</html>
`;

const adminShipmentNotificationTemplate = (shipment) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1a237e; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; }
        .footer { text-align: center; padding: 20px; background-color: #f5f5f5; }
        .shipment-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-radius: 5px; }
        .customer-info { background-color: #eff6ff; padding: 15px; margin: 15px 0; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New Shipment Created</h1>
        </div>
        <div class="content">
            <p>A new shipment has been created in the system:</p>
            
            <div class="customer-info">
                <h3>Customer Information</h3>
                <p><strong>Name:</strong> ${shipment.customerName}</p>
                <p><strong>Email:</strong> ${shipment.customerEmail}</p>
                <p><strong>Phone:</strong> ${shipment.customerPhone}</p>
            </div>
            
            <div class="shipment-details">
                <h3>Shipment Details</h3>
                <p><strong>Tracking Number:</strong> ${shipment.trackingId}</p>
                <p><strong>Origin:</strong> ${shipment.origin}</p>
                <p><strong>Destination:</strong> ${shipment.destination}</p>
                <p><strong>Package Type:</strong> ${shipment.packageType}</p>
                <p><strong>Weight:</strong> ${shipment.weight} kg</p>
                <p><strong>Dimensions:</strong> ${
                  shipment.dimensions.length || "N/A"
                } x ${shipment.dimensions.width || "N/A"} x ${
  shipment.dimensions.height || "N/A"
} cm</p>
                <p><strong>Estimated Delivery:</strong> ${new Date(
                  shipment.estimatedDelivery
                ).toDateString()}</p>
                <p><strong>Status:</strong> ${shipment.status}</p>
                <p><strong>Fragile:</strong> ${
                  shipment.fragile ? "Yes" : "No"
                }</p>
                <p><strong>Insurance Included:</strong> ${
                  shipment.insuranceIncluded ? "Yes" : "No"
                }</p>
                <p><strong>Express Delivery:</strong> ${
                  shipment.expressDelivery ? "Yes" : "No"
                }</p>
                ${
                  shipment.additionalNotes
                    ? `<p><strong>Additional Notes:</strong> ${shipment.additionalNotes}</p>`
                    : ""
                }
            </div>
            
            <p>Please log in to the admin dashboard to manage this shipment.</p>
        </div>
        <div class="footer">
            <p>This is an automated message from the Steph Logistics shipping system.</p>
        </div>
    </div>
</body>
</html>
`;

// Function to create a sample shipment for testing purposes
const createSampleShipment = async () => {
  try {
    // Check if we already have the sample shipment
    const existingShipment = await Shipment.findOne({
      trackingId: "DX123456TEST",
    });

    if (existingShipment) {
      console.log("Sample shipment already exists");
      return existingShipment;
    }

    const sampleShipment = new Shipment({
      trackingId: "SP123456TEST",
      customerName: "Test Customer",
      customerEmail: "test@example.com",
      customerPhone: "+000 0000 0000",
      origin: "London, UK",
      destination: "Manchester, UK",
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
      weight: 10,
      dimensions: {
        length: 30,
        width: 20,
        height: 15,
      },
      packageType: "Parcel",
      fragile: false,
      insuranceIncluded: true,
      expressDelivery: false,
      status: "In Transit",
      statusHistory: [
        {
          status: "Pending",
          location: "London Warehouse",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          note: "Package received at origin facility",
        },
        {
          status: "In Transit",
          location: "London Distribution Center",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          note: "Package in transit to destination",
        },
      ],
    });

    await sampleShipment.save();
    console.log("Sample shipment created with tracking ID: DX123456TEST");
    return sampleShipment;
  } catch (error) {
    console.error("Error creating sample shipment:", error);
  }
};

// Get tracking page
exports.getTrackingPage = async (req, res) => {
  // Check if there's a tracking ID in the query
  const trackingId = req.query.id;

  // Create a sample shipment for testing
  await createSampleShipment();

  // If a tracking ID is provided in the query, track the shipment
  if (trackingId) {
    try {
      // Ensure we get fresh data by using lean() to get plain objects
      // Find by either trackingId or trackingNumber (supports legacy IDs)
      const shipment = await Shipment.findOne({
        $or: [{ trackingId: trackingId }, { trackingNumber: trackingId }],
      })
        .lean()
        .exec();

      if (shipment) {
        // Fix any potential timestamp issues in statusHistory
        if (shipment.statusHistory && shipment.statusHistory.length > 0) {
          // Ensure all timestamps are Date objects
          shipment.statusHistory = shipment.statusHistory.map((entry) => ({
            ...entry,
            timestamp: entry.timestamp || new Date(),
          }));

          // Sort by timestamp, newest first
          shipment.statusHistory.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          );
        }

        // Format dimensions for display
        if (shipment.dimensions) {
          shipment.dimensions = `${shipment.dimensions.length || 0} × ${
            shipment.dimensions.width || 0
          } × ${shipment.dimensions.height || 0} cm`;
        } else {
          shipment.dimensions = "N/A";
        }

        // Calculate progress percentage based on status
        let statusProgress = 5;
        if (shipment.status === "Pending") {
          statusProgress = 15;
        } else if (shipment.status === "In Transit") {
          statusProgress = 55;
        } else if (shipment.status === "Delivered") {
          statusProgress = 100;
        } else if (shipment.status === "Delayed") {
          statusProgress = 65;
        }

        // Convert to string with % for style attribute
        const progressStyle = `${statusProgress}%`;

        // Debug information
        console.log("Tracking shipment from query:", shipment.trackingId);
        console.log("Current status:", shipment.status);
        console.log(
          "Status history:",
          JSON.stringify(shipment.statusHistory, null, 2)
        );

        // Render the result page directly
        return res.render("shipment/track-result", {
          title: "Shipment Information",
          path: "/shipment/track",
          shipment: shipment,
          statusProgress: statusProgress,
          progressStyle: progressStyle,
          layout: "layouts/main",
          extraCSS: '<link rel="stylesheet" href="/assets/css/track.css">',
        });
      }
    } catch (error) {
      console.error("Error tracking shipment from query:", error);
      // Continue to regular tracking page if there's an error
    }
  }

  // Render the regular tracking page
  res.render("shipment/track", {
    title: "Track Your Shipment",
    path: "/shipment/track",
    errorMessage: null,
    shipment: null,
    layout: "layouts/main",
    extraCSS: '<link rel="stylesheet" href="/assets/css/track.css">',
  });
};

// Track a shipment
exports.trackShipment = async (req, res) => {
  const trackingId = req.body.trackingId;

  // If no tracking ID provided, just show the form
  if (!trackingId) {
    return res.render("shipment/track", {
      title: "Track Your Shipment",
      path: "/shipment/track",
      errorMessage: "Please enter a tracking ID",
      shipment: null,
    });
  }

  try {
    // Ensure we get fresh data by using lean() to get plain objects and not mongoose documents
    const shipment = await Shipment.findOne({
      $or: [{ trackingId: trackingId }, { trackingNumber: trackingId }],
    })
      .lean() // Get plain JavaScript object instead of mongoose document
      .exec();

    if (!shipment) {
      return res.render("shipment/track", {
        title: "Track Your Shipment",
        path: "/shipment/track",
        errorMessage: "No shipment found with that tracking ID",
        shipment: null,
      });
    }

    // Fix any potential timestamp issues in statusHistory
    if (shipment.statusHistory && shipment.statusHistory.length > 0) {
      // Ensure all timestamps are Date objects
      shipment.statusHistory = shipment.statusHistory.map((entry) => ({
        ...entry,
        timestamp: entry.timestamp || new Date(),
      }));

      // Sort by timestamp, newest first
      shipment.statusHistory.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    }

    // Format dimensions for display
    if (shipment.dimensions) {
      shipment.dimensions = `${shipment.dimensions.length || 0} × ${
        shipment.dimensions.width || 0
      } × ${shipment.dimensions.height || 0} cm`;
    } else {
      shipment.dimensions = "N/A";
    }

    // Calculate progress percentage based on status
    let statusProgress = 5;
    if (shipment.status === "Pending") {
      statusProgress = 15;
    } else if (shipment.status === "In Transit") {
      statusProgress = 55;
    } else if (shipment.status === "Delivered") {
      statusProgress = 100;
    } else if (shipment.status === "Delayed") {
      statusProgress = 65;
    }

    // Convert to string with % for style attribute
    const progressStyle = `${statusProgress}%`;

    // Debug information
    console.log("Tracking shipment:", shipment.trackingId);
    console.log("Current status:", shipment.status);
    console.log(
      "Status history:",
      JSON.stringify(shipment.statusHistory, null, 2)
    );

    res.render("shipment/track-result", {
      title: "Shipment Information",
      path: "/shipment/track",
      shipment: shipment,
      statusProgress: statusProgress,
      progressStyle: progressStyle,
    });
  } catch (error) {
    console.error("Error tracking shipment:", error);
    res.render("shipment/track", {
      title: "Track Your Shipment",
      path: "/shipment/track",
      errorMessage: "An error occurred while tracking your shipment",
      shipment: null,
    });
  }
};

// Get shipment request page
exports.getRequestPage = (req, res) => {
  res.render("shipment/request", {
    title: "Request a Shipment",
    path: "/shipment/request",
    errorMessage: null,
    formData: {},
  });
};

// Create a shipment request
exports.createShipmentRequest = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      origin,
      destination,
      estimatedDelivery,
      weight,
      length,
      width,
      height,
      packageType,
      fragile,
      insuranceIncluded,
      expressDelivery,
      additionalNotes,
    } = req.body;

    // Create new shipment object
    const shipment = new Shipment({
      customerName,
      customerEmail,
      customerPhone,
      origin,
      destination,
      estimatedDelivery: new Date(estimatedDelivery),
      weight,
      dimensions: {
        length,
        width,
        height,
      },
      packageType,
      fragile: fragile === "on",
      insuranceIncluded: insuranceIncluded === "on",
      expressDelivery: expressDelivery === "on",
      additionalNotes,
      statusHistory: [
        {
          status: "Pending",
          location: origin,
          note: "Shipment created",
        },
      ],
    });

    // Save to database
    await shipment.save();

    // Send email notifications
    try {
      // Send confirmation to customer
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: customerEmail,
        subject: "Your Shipment Confirmation - Steph Logistics",
        html: customerShipmentConfirmationTemplate(shipment),
      });

      // Send notification to admin
      await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: "support@stephlogistics.co.uk",
        subject: `New Shipment Created - ${shipment.trackingId}`,
        html: adminShipmentNotificationTemplate(shipment),
      });
    } catch (emailError) {
      console.error("Error sending shipment emails:", emailError);
      // Continue processing even if email fails
    }

    // Render success page
    res.render("shipment/request-success", {
      title: "Shipment Request Successful",
      path: "/shipment/request",
      shipment: shipment,
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.render("shipment/request", {
      title: "Request a Shipment",
      path: "/shipment/request",
      errorMessage: "An error occurred while processing your request",
      formData: req.body,
    });
  }
};

// Get create shipment page
exports.getCreateShipmentPage = (req, res) => {
  res.render("shipment/create-shipment", {
    title: "Create a Shipment",
    path: "/shipment/create",
    layout: "layouts/main", // Explicitly specify the layout
    extraCSS: '<link rel="stylesheet" href="/assets/css/create-shipment.css">',
  });
};

// Create a shipment
exports.createShipment = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      customerPhone,
      company,
      reference,
      origin,
      destination,
      packageType,
      weight,
      dimensions,
      contents,
      fragile,
      insuranceIncluded,
      declaredValue,
      carrier,
      expressDelivery,
      saturdayDelivery,
      paymentMethod,
      estimatedDelivery,
    } = req.body;

    // Validate required fields
    if (
      !customerName ||
      !customerEmail ||
      !customerPhone ||
      !origin ||
      !destination
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Map carrier to enum value
    let carrierEnum = "Other";
    if (carrier === "ups") carrierEnum = "UPS";
    else if (carrier === "fedex") carrierEnum = "FedEx";
    else if (carrier === "dhl") carrierEnum = "DHL";

    // Map package type
    let packageTypeEnum = "Parcel";
    if (packageType === "envelope") packageTypeEnum = "Document";
    else if (packageType === "pallet") packageTypeEnum = "Freight";
    else if (expressDelivery) packageTypeEnum = "Express";

    // Create new shipment
    const shipment = new Shipment({
      customerName,
      customerEmail,
      customerPhone,
      origin,
      destination,
      packageType: packageTypeEnum,
      weight,
      dimensions: dimensions || {
        length: 0,
        width: 0,
        height: 0,
      },
      estimatedDelivery: new Date(estimatedDelivery),
      fragile: !!fragile,
      insuranceIncluded: !!insuranceIncluded,
      expressDelivery: !!expressDelivery,
      additionalNotes: contents,
      carrier: carrierEnum,
      carrierServiceLevel:
        carrierEnum + (saturdayDelivery ? " Saturday Delivery" : " Standard"),
      paymentMethod,
      paymentStatus: "Paid", // Since we're creating this after payment
      statusHistory: [
        {
          status: "Pending",
          location: origin,
          note: "Shipment created",
        },
      ],
      // Add trackingNumber field to match existing schema/index
      trackingNumber: "PENDING", // This will be replaced with trackingId after save
    });

    // Save to database
    await shipment.save();

    // After saving, ensure trackingNumber matches trackingId (to fix database schema mismatch)
    shipment.trackingNumber = shipment.trackingId;
    await shipment.save();

    console.log("Shipment created:", shipment.trackingId);

    // Send email notifications
    try {
      // Send confirmation to customer
      await transporter.sendMail({
        from: `"Steph Logistics" <${
          process.env.SMTP_USER || "noreply@stephlogistics.co.uk"
        }>`,
        to: customerEmail,
        subject: "Your Shipment Confirmation",
        html: customerShipmentConfirmationTemplate(shipment),
      });

      // Send notification to admin
      await transporter.sendMail({
        from: `"Steph Logistics System" <${
          process.env.SMTP_USER || "noreply@stephlogistics.co.uk"
        }>`,
        to: process.env.ADMIN_EMAIL || "admin@stephlogistics.co.uk",
        subject: `New Shipment Created - ${shipment.trackingId}`,
        html: adminShipmentNotificationTemplate(shipment),
      });

      console.log("Shipment notification emails sent");
    } catch (emailError) {
      console.error("Error sending email notifications:", emailError);
      // Continue even if emails fail
    }

    // Return success with IDs
    res.status(201).json({
      success: true,
      message: "Shipment created successfully",
      shipmentId: shipment._id,
      trackingId: shipment.trackingId,
    });
  } catch (error) {
    console.error("Error creating shipment:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating your shipment",
    });
  }
};
