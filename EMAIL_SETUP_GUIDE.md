# Email Configuration Fix Guide

## Issue

Quote submission is failing with Gmail authentication error: "Invalid login: 535-5.7.8 Username and Password not accepted"

## Root Cause

The application is trying to use Gmail SMTP with incorrect credentials or outdated authentication method.

## Solution Steps

### 1. Gmail App Password Setup

1. Go to your Google Account settings
2. Enable 2-Factor Authentication if not already enabled
3. Go to Security > App passwords
4. Generate a new app password for "Mail"
5. Use this app password instead of your regular Gmail password

### 2. Environment Variables Required

Add these to your `.env` file:

```env
# Email Configuration
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your-gmail@gmail.com
EMAIL_PASSWORD=your-16-character-app-password
SMTP_USER=your-gmail@gmail.com
BASE_URL=https://stephlogistics.co.uk
SITE_URL=https://stephlogistics.co.uk
```

### 3. Alternative: Use a Business Email Service

For better deliverability and professionalism, consider using:

- Google Workspace (business Gmail)
- Microsoft 365
- SendGrid
- Mailgun

### 4. Test Configuration

Run this test script to verify email setup:

```javascript
const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransporter({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Email configuration error:", error);
  } else {
    console.log("Email server is ready to take our messages");
  }
});
```

## Immediate Action Required

1. Update your `.env` file with correct Gmail app password
2. Restart the application
3. Test quote submission functionality
