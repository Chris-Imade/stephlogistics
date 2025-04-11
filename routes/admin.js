const express = require("express");
const router = express.Router();
const {
  authenticateUser,
  isAdmin,
  isStaffOrAdmin,
} = require("../middleware/auth");
const Shipment = require("../models/Shipment");
const User = require("../models/User");
const Newsletter = require("../models/Newsletter");
const Contact = require("../models/Contact");
const Franchise = require("../models/Franchise");

// Admin dashboard
router.get("/dashboard", authenticateUser, isStaffOrAdmin, async (req, res) => {
  try {
    // Get counts for dashboard stats
    const totalShipments = await Shipment.countDocuments();
    const pendingShipments = await Shipment.countDocuments({
      status: { $in: ["created", "processing"] },
    });
    const deliveredShipments = await Shipment.countDocuments({
      status: "delivered",
    });
    const subscribers = await Newsletter.countDocuments({ isSubscribed: true });
    const contacts = await Contact.countDocuments({ isResolved: false });

    // Get recent shipments
    const recentShipments = await Shipment.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.render("admin/dashboard", {
      title: "Admin Dashboard - DXpress",
      layout: "layouts/admin",
      user: req.user,
      stats: {
        totalShipments,
        pendingShipments,
        deliveredShipments,
        subscribers,
        contacts,
      },
      recentShipments,
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.render("admin/dashboard", {
      title: "Admin Dashboard - DXpress",
      layout: "layouts/admin",
      user: req.user,
      error: "An error occurred while loading dashboard",
    });
  }
});

// Shipment management page
router.get("/shipments", authenticateUser, isStaffOrAdmin, (req, res) => {
  res.render("admin/shipments", {
    title: "Shipment Management - DXpress Admin",
    layout: "layouts/admin",
    user: req.user,
  });
});

// Shipment details page
router.get(
  "/shipment/:id",
  authenticateUser,
  isStaffOrAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find shipment by ID
      const shipment = await Shipment.findById(id);

      if (!shipment) {
        return res.render("admin/shipment-details", {
          title: "Shipment Details - DXpress Admin",
          layout: "layouts/admin",
          user: req.user,
          error: "Shipment not found",
        });
      }

      res.render("admin/shipment-details", {
        title: "Shipment Details - DXpress Admin",
        layout: "layouts/admin",
        user: req.user,
        shipment,
      });
    } catch (error) {
      console.error("Shipment details error:", error);
      res.render("admin/shipment-details", {
        title: "Shipment Details - DXpress Admin",
        layout: "layouts/admin",
        user: req.user,
        error: "An error occurred while loading shipment details",
      });
    }
  }
);

// Newsletter management page
router.get("/newsletter", authenticateUser, isStaffOrAdmin, (req, res) => {
  res.render("admin/newsletter", {
    title: "Newsletter Management - DXpress Admin",
    layout: "layouts/admin",
    user: req.user,
  });
});

// Contact inquiries page
router.get("/contacts", authenticateUser, isStaffOrAdmin, (req, res) => {
  res.render("admin/contacts", {
    title: "Contact Inquiries - DXpress Admin",
    layout: "layouts/admin",
    user: req.user,
  });
});

// Franchise applications page
router.get("/franchises", authenticateUser, isAdmin, (req, res) => {
  res.render("admin/franchises", {
    title: "Franchise Applications - DXpress Admin",
    layout: "layouts/admin",
    user: req.user,
  });
});

// User management page (Admin only)
router.get("/users", authenticateUser, isAdmin, (req, res) => {
  res.render("admin/users", {
    title: "User Management - DXpress Admin",
    layout: "layouts/admin",
    user: req.user,
  });
});

// Edit profile page
router.get("/profile", authenticateUser, isStaffOrAdmin, (req, res) => {
  res.render("admin/profile", {
    title: "Edit Profile - DXpress Admin",
    layout: "layouts/admin",
    user: req.user,
  });
});

// API Routes for Admin Panel

// Get all shipments (API)
router.get(
  "/api/shipments",
  authenticateUser,
  isStaffOrAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status, search } = req.query;

      // Build query based on filters
      const query = {};

      if (status && status !== "all") {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { trackingNumber: { $regex: search, $options: "i" } },
          { "customer.name": { $regex: search, $options: "i" } },
          { "customer.email": { $regex: search, $options: "i" } },
        ];
      }

      // Count total shipments
      const total = await Shipment.countDocuments(query);

      // Get shipments with pagination
      const shipments = await Shipment.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      res.status(200).json({
        success: true,
        shipments,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("Shipments list error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching shipments",
      });
    }
  }
);

// Update shipment status (API)
router.patch(
  "/api/shipment/:id/status",
  authenticateUser,
  isStaffOrAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, location, note } = req.body;

      // Find shipment
      const shipment = await Shipment.findById(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      // Update status
      shipment.status = status;

      // Add status history entry
      shipment.statusHistory.push({
        status,
        location: location || "System",
        note: note || `Status updated to ${status}`,
        timestamp: Date.now(),
      });

      await shipment.save();

      res.status(200).json({
        success: true,
        message: "Shipment status updated successfully",
        shipment,
      });
    } catch (error) {
      console.error("Shipment status update error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating shipment status",
      });
    }
  }
);

// Delete shipment (API)
router.delete(
  "/api/shipment/:id",
  authenticateUser,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;

      // Find and delete shipment
      const shipment = await Shipment.findByIdAndDelete(id);

      if (!shipment) {
        return res.status(404).json({
          success: false,
          message: "Shipment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Shipment deleted successfully",
      });
    } catch (error) {
      console.error("Shipment delete error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while deleting shipment",
      });
    }
  }
);

// Get all contacts (API)
router.get(
  "/api/contacts",
  authenticateUser,
  isStaffOrAdmin,
  async (req, res) => {
    try {
      const { page = 1, limit = 10, status } = req.query;

      // Build query based on status filter
      const query = {};
      if (status === "resolved") {
        query.isResolved = true;
      } else if (status === "unresolved") {
        query.isResolved = false;
      }

      // Count total contacts
      const total = await Contact.countDocuments(query);

      // Get contacts with pagination
      const contacts = await Contact.find(query)
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit);

      res.status(200).json({
        success: true,
        contacts,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
        total,
      });
    } catch (error) {
      console.error("Contacts list error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while fetching contacts",
      });
    }
  }
);

// Update contact status (API)
router.patch(
  "/api/contact/:id",
  authenticateUser,
  isStaffOrAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isResolved, notes } = req.body;

      // Find contact
      const contact = await Contact.findById(id);

      if (!contact) {
        return res.status(404).json({
          success: false,
          message: "Contact not found",
        });
      }

      // Update fields
      contact.isResolved =
        isResolved !== undefined ? isResolved : contact.isResolved;

      if (notes) {
        contact.notes = notes;
      }

      if (isResolved) {
        contact.resolvedAt = Date.now();
      }

      await contact.save();

      res.status(200).json({
        success: true,
        message: "Contact updated successfully",
        contact,
      });
    } catch (error) {
      console.error("Contact update error:", error);
      res.status(500).json({
        success: false,
        message: "An error occurred while updating contact",
      });
    }
  }
);

// Get all users (API - Admin only)
router.get("/api/users", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;

    // Build query based on role filter
    const query = {};
    if (role && role !== "all") {
      query.role = role;
    }

    // Count total users
    const total = await User.countDocuments(query);

    // Get users with pagination
    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    res.status(200).json({
      success: true,
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    console.error("Users list error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching users",
    });
  }
});

// Create new user (API - Admin only)
router.post("/api/user", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password,
      role,
      phone,
    });

    await user.save();

    // Return user data (except password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating user",
    });
  }
});

// Update user (API - Admin only)
router.patch("/api/user/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;

    // Find user
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone) user.phone = phone;

    await user.save();

    // Return updated user data (except password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("User update error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating user",
    });
  }
});

// Delete user (API - Admin only)
router.delete("/api/user/:id", authenticateUser, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting self
    if (id === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot delete your own account",
      });
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("User delete error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting user",
    });
  }
});

// Update profile (API)
router.patch("/api/profile", authenticateUser, async (req, res) => {
  try {
    const { name, email, phone, currentPassword, newPassword } = req.body;

    // Find user
    const user = await User.findById(req.user._id);

    // Update basic info
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;

    // Update password if provided
    if (currentPassword && newPassword) {
      // Check current password
      const isMatch = await user.comparePassword(currentPassword);

      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Set new password
      user.password = newPassword;
    }

    await user.save();

    // Return updated user data (except password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
    };

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: userData,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating profile",
    });
  }
});

module.exports = router;
