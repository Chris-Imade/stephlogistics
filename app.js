require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const ejsLocals = require("ejs-locals");
const expressLayouts = require("express-ejs-layouts");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const methodOverride = require("method-override");
const path = require("path");
// Import seed file
const { seedAll } = require("./seed");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5678;

// Connect to MongoDB
mongoose
  .connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/steph-logistics"
  )
  .then(() => {
    console.log("MongoDB connected");
    // Run seed after successful connection
    seedAll()
      .then(() => {
        console.log("Database seeded successfully");
      })
      .catch((err) => {
        console.error("Error seeding database:", err);
      });
  })
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 3600000 }, // 1 hour
  })
);

// Import flash messaging if it exists
try {
  const flash = require("connect-flash");
  app.use(flash());
} catch (err) {
  console.log("Flash messaging not available, continuing without it");
}

// Setup EJS
app.engine("ejs", ejsLocals);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.set("layout", "layouts/main");
app.set("layout extractScripts", true);
app.set("layout extractStyles", true);

// Add middleware to set default variables for all views
app.use((req, res, next) => {
  res.locals.baseUrl = `${req.protocol}://${req.get("host")}`;
  next();
});

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Copy existing assets to public folder
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Routes
const indexRoutes = require("./routes/index");
const adminRoutes = require("./routes/admin");
const shipmentRoutes = require("./routes/shipment");
const newsletterRoutes = require("./routes/newsletter");
const franchiseRoutes = require("./routes/franchise");
const aboutRoutes = require("./routes/about");
const serviceRoutes = require("./routes/service");
const contactRoutes = require("./routes/contact");
const blogRoutes = require("./routes/blog");
const teamRoutes = require("./routes/team");
const projectRoutes = require("./routes/project");
const apiRoutes = require("./routes/api");
const ecommerceRoutes = require("./routes/ecommerce");
const shippingRoutes = require("./routes/shipping");
const trackRoutes = require("./routes/track");
const pricingRoutes = require("./routes/pricing");
const faqRoutes = require("./routes/faq");
const careersRoutes = require("./routes/careers");
const legalRoutes = require("./routes/legal");

// Apply routes
app.use("/", indexRoutes);
app.use("/admin", adminRoutes);
app.use("/shipment", shipmentRoutes);
app.use("/newsletter", newsletterRoutes);
app.use("/franchise", franchiseRoutes);
app.use("/about", aboutRoutes);
app.use("/service", serviceRoutes);
app.use("/services", serviceRoutes); // Alias for service routes
app.use("/contact", contactRoutes);
app.use("/blog", blogRoutes);
app.use("/team", teamRoutes);
app.use("/project", projectRoutes);
app.use("/api", apiRoutes);
app.use("/ecommerce-integration", ecommerceRoutes);
app.use("/international-shipping", shippingRoutes);
app.use("/track", trackRoutes);
app.use("/pricing", pricingRoutes);
app.use("/faq", faqRoutes);
app.use("/careers", careersRoutes);
app.use("/legal", legalRoutes);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", {
    title: "404 - Page Not Found",
    layout: "layouts/main",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
