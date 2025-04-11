const express = require("express");
const router = express.Router();
const User = require("../models/User");
const {
  generateToken,
  generateResetToken,
} = require("../utils/tokenGenerator");
const { sendPasswordResetEmail } = require("../config/email");
const { authenticateUser } = require("../middleware/auth");

// Login page route
router.get("/login", (req, res) => {
  res.render("auth/login", {
    title: "Login - DXpress",
    layout: "layouts/auth",
    message: req.query.message,
  });
});

// Register page route
router.get("/register", (req, res) => {
  res.render("auth/register", {
    title: "Register - DXpress",
    layout: "layouts/auth",
  });
});

// Forgot password page route
router.get("/forgot-password", (req, res) => {
  res.render("auth/forgot-password", {
    title: "Forgot Password - DXpress",
    layout: "layouts/auth",
  });
});

// Reset password page route
router.get("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.render("auth/reset-password", {
        title: "Reset Password - DXpress",
        layout: "layouts/auth",
        error: "Password reset token is invalid or has expired",
        token: null,
      });
    }

    res.render("auth/reset-password", {
      title: "Reset Password - DXpress",
      layout: "layouts/auth",
      token,
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.render("auth/reset-password", {
      title: "Reset Password - DXpress",
      layout: "layouts/auth",
      error: "An error occurred. Please try again",
      token: null,
    });
  }
});

// Process login
router.post("/login", async (req, res) => {
  try {
    const { email, password, remember } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie options
    const cookieOptions = {
      httpOnly: true,
      expires: remember
        ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        : new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    };

    // Set token in cookie
    res.cookie("token", token, cookieOptions);

    // Return user data (except password)
    const userData = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: userData,
      redirectTo:
        user.role === "admin" || user.role === "staff"
          ? "/admin/dashboard"
          : "/",
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during login. Please try again",
    });
  }
});

// Process registration
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

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
      phone,
      role: "user", // Default role
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
    });

    res.status(201).json({
      success: true,
      message: "Registration successful",
      redirectTo: "/",
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again",
    });
  }
});

// Process forgot password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with that email address",
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();

    // Save token and expiration time to user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

    await user.save();

    // Send password reset email
    const emailSent = await sendPasswordResetEmail(email, resetToken);

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again",
      });
    }

    res.status(200).json({
      success: true,
      message: "Password reset email sent. Please check your inbox",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again",
    });
  }
});

// Process reset password
router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    // Check if passwords match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired",
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password",
      redirectTo: "/auth/login",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred. Please try again",
    });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("token");
  res.redirect("/auth/login");
});

// Get current user
router.get("/me", authenticateUser, (req, res) => {
  const user = {
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    phone: req.user.phone,
  };

  res.status(200).json({
    success: true,
    user,
  });
});

module.exports = router;
