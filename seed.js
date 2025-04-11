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
      email: process.env.ADMIN_EMAIL || "admin@stephlogistics.com",
    });

    if (adminExists) {
      console.log("Admin user already exists");
      return;
    }

    // Create admin user
    const adminUser = new User({
      name: "Admin User",
      email: process.env.ADMIN_EMAIL || "admin@stephlogistics.com",
      password: process.env.ADMIN_PASSWORD || "admin123",
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
        trackingNumber: "SL12345678",
        customer: {
          name: "John Doe",
          email: "john@example.com",
          phone: "+1234567890",
        },
        origin: {
          address: "123 Main St",
          city: "New York",
          state: "NY",
          postalCode: "10001",
          country: "USA",
        },
        destination: {
          address: "456 Market St",
          city: "San Francisco",
          state: "CA",
          postalCode: "94103",
          country: "USA",
        },
        package: {
          type: "package",
          weight: {
            value: 5,
            unit: "kg",
          },
          dimensions: {
            length: 20,
            width: 15,
            height: 10,
            unit: "cm",
          },
          isFragile: false,
          insuranceRequired: true,
          declaredValue: {
            value: 100,
            currency: "USD",
          },
        },
        shipping: {
          carrier: "DHL",
          service: "Express",
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          rate: {
            value: 45.75,
            currency: "USD",
          },
        },
        payment: {
          method: "credit_card",
          status: "completed",
          transactionId: "TR123456",
          amount: 45.75,
          currency: "USD",
          paidAt: new Date(),
        },
        status: "in_transit",
        statusHistory: [
          {
            status: "created",
            location: "System",
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            note: "Shipment created",
          },
          {
            status: "processing",
            location: "New York Sorting Center",
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            note: "Shipment processing",
          },
          {
            status: "in_transit",
            location: "New York International Airport",
            timestamp: new Date(),
            note: "Shipment in transit",
          },
        ],
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        trackingNumber: "SL87654321",
        customer: {
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "+1987654321",
        },
        origin: {
          address: "789 Oak St",
          city: "Chicago",
          state: "IL",
          postalCode: "60601",
          country: "USA",
        },
        destination: {
          address: "321 Pine St",
          city: "Miami",
          state: "FL",
          postalCode: "33101",
          country: "USA",
        },
        package: {
          type: "document",
          weight: {
            value: 0.5,
            unit: "kg",
          },
          dimensions: {
            length: 30,
            width: 20,
            height: 1,
            unit: "cm",
          },
          isFragile: false,
          insuranceRequired: false,
          declaredValue: {
            value: 20,
            currency: "USD",
          },
        },
        shipping: {
          carrier: "FedEx",
          service: "Priority",
          estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          rate: {
            value: 25.3,
            currency: "USD",
          },
        },
        payment: {
          method: "paypal",
          status: "completed",
          transactionId: "PP987654",
          amount: 25.3,
          currency: "USD",
          paidAt: new Date(),
        },
        status: "created",
        statusHistory: [
          {
            status: "created",
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
    process.exit(0);
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

// Run the seeder
seedAll();
