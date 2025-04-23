require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
const Shipment = require("./models/Shipment");
const Newsletter = require("./models/Newsletter");
const Contact = require("./models/Contact");

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/steph-logistics"
  )
  .then(() => console.log("MongoDB connected for seeding"))
  .catch((err) => {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  });

// Seed admin user
const seedAdminUser = async () => {
  try {
    // Check if admin user already exists
    const adminExists = await User.findOne({
      email: process.env.ADMIN_EMAIL || "admin@stephlogistics.co.uk",
    });

    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      fullName: "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@stephlogistics.co.uk",
      password: process.env.ADMIN_PASSWORD || "$IamtheAdmin11",
      role: "admin",
      phone: "+1234567890",
    });

    await adminUser.save();
    console.log("Admin user created");
  } catch (error) {
    console.error("Error seeding admin user:", error);
  }
};

// Seed sample shipments
const seedShipments = async () => {
  try {
    // Check if shipments already exist
    const shipmentsCount = await Shipment.countDocuments();

    if (shipmentsCount > 0) {
      console.log("Shipments already exist");
      return;
    }

    // Sample shipments data
    const shipments = [
      {
        trackingId: "SP010123ABC",
        trackingNumber: "SP010123ABC",
        customerName: "John Doe",
        customerEmail: "john@example.com",
        customerPhone: "+1234567890",
        origin: "123 Main St, New York, NY 10001, USA",
        destination: "456 Market St, San Francisco, CA 94103, USA",
        packageType: "Parcel",
        weight: 5,
        dimensions: {
          length: 20,
          width: 15,
          height: 10,
        },
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        status: "In Transit",
        fragile: false,
        insuranceIncluded: true,
        carrier: "DHL",
        carrierServiceLevel: "Express",
        shippingCost: {
          amount: 45.75,
          currency: "USD",
        },
        paymentStatus: "Paid",
        paymentMethod: "credit_card",
        statusHistory: [
          {
            status: "Pending",
            location: "System",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            note: "Shipment created",
          },
          {
            status: "Pending",
            location: "New York Sorting Center",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            note: "Shipment processing",
          },
          {
            status: "In Transit",
            location: "New York International Airport",
            timestamp: new Date(),
            note: "Shipment in transit",
          },
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        trackingId: "SP010124XYZ",
        trackingNumber: "SP010124XYZ",
        customerName: "Jane Smith",
        customerEmail: "jane@example.com",
        customerPhone: "+1987654321",
        origin: "789 Oak St, Chicago, IL 60601, USA",
        destination: "321 Pine St, Miami, FL 33101, USA",
        packageType: "Document",
        weight: 0.5,
        dimensions: {
          length: 30,
          width: 20,
          height: 1,
        },
        estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
        status: "Pending",
        fragile: false,
        insuranceIncluded: false,
        carrier: "FedEx",
        carrierServiceLevel: "Priority",
        shippingCost: {
          amount: 25.3,
          currency: "USD",
        },
        paymentStatus: "Paid",
        paymentMethod: "paypal",
        statusHistory: [
          {
            status: "Pending",
            location: "System",
            timestamp: new Date(),
            note: "Shipment created",
          },
        ],
        createdAt: new Date(),
      },
    ];

    await Shipment.insertMany(shipments);
    console.log("Sample shipments created");
  } catch (error) {
    console.error("Error seeding shipments:", error);
  }
};

// Seed sample newsletter subscribers
const seedNewsletterSubscribers = async () => {
  try {
    // Check if subscribers already exist
    const subscribersCount = await Newsletter.countDocuments();

    if (subscribersCount > 0) {
      console.log("Newsletter subscribers already exist");
      return;
    }

    // Sample subscribers data
    const subscribers = [
      {
        email: "subscriber1@example.com",
        name: "John Subscriber",
        isSubscribed: true,
        subscribedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        token: "token123",
      },
      {
        email: "subscriber2@example.com",
        name: "Jane Subscriber",
        isSubscribed: true,
        subscribedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        token: "token456",
      },
      {
        email: "unsubscribed@example.com",
        name: "Former Subscriber",
        isSubscribed: false,
        subscribedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
        unsubscribedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        token: "token789",
      },
    ];

    await Newsletter.insertMany(subscribers);
    console.log("Sample newsletter subscribers created");
  } catch (error) {
    console.error("Error seeding newsletter subscribers:", error);
  }
};

// Seed sample contact inquiries
const seedContactInquiries = async () => {
  try {
    // Check if contacts already exist
    const contactsCount = await Contact.countDocuments();

    if (contactsCount > 0) {
      console.log("Contact inquiries already exist");
      return;
    }

    // Sample contacts data
    const contacts = [
      {
        name: "John Smith",
        email: "john.smith@example.com",
        phone: "+1234567890",
        subject: "Shipping Inquiry",
        message:
          "I would like to know more about your international shipping rates.",
        isResolved: false,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Sarah Johnson",
        email: "sarah.j@example.com",
        phone: "+1987654321",
        subject: "Package Tracking Issue",
        message:
          "I am unable to track my package with tracking number DX98765432.",
        isResolved: true,
        notes: "Helped customer locate the correct tracking number.",
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        resolvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        name: "Michael Brown",
        email: "michael.b@example.com",
        phone: "+1122334455",
        subject: "Franchise Information",
        message:
          "I am interested in opening a franchise in my city. Please provide more information.",
        isResolved: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    await Contact.insertMany(contacts);
    console.log("Sample contact inquiries created");
  } catch (error) {
    console.error("Error seeding contact inquiries:", error);
  }
};

// Run all seed functions
const seedAll = async () => {
  try {
    await seedAdminUser();
    await seedShipments();
    await seedNewsletterSubscribers();
    await seedContactInquiries();

    console.log("Seeding completed successfully");
    return true;
  } catch (error) {
    console.error("Error seeding data:", error);
    throw error;
  }
};

// Export the seedAll function
module.exports = { seedAll };

// Only run the seeder if this file is executed directly
if (require.main === module) {
  seedAll()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
