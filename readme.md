# Steph Logistics - Shipping and Logistics Platform

A comprehensive shipping and logistics platform built with Node.js, Express, and EJS templating engine. This application offers various shipping services, tracking capabilities, e-commerce integration, and franchise opportunities.

## 🚀 Features

### 📦 Core Shipping Services

- **Parcel Delivery** - UK-wide delivery services
- **International Shipping** - Global shipping solutions
- **Freight & Pallet Shipping** - B2B and bulk shipping options
- **E-Commerce Integration** - Seamless connection with major e-commerce platforms
- **Tracked & Signed Deliveries** - Premium tracked shipping options
- **Logistics Strategy** - Consulting and optimization services

### 🔎 Shipment Tracking

- Real-time shipment tracking
- Email notifications for status updates
- Branded tracking pages

### 🛒 E-Commerce Integration

- Integration with major platforms (Shopify, WooCommerce, Magento, Etsy)
- Automated shipping label generation
- Real-time tracking information
- Custom shipping rules configuration

### 💼 Franchise Opportunities

- Franchise application system
- Email notifications to applicants and administrators
- Comprehensive information for potential franchisees
- Dynamic form with validation and visual feedback

### 👤 User Authentication

- Secure user registration and login
- Admin dashboard for managing services and tracking
- User profiles and history

## 🛠️ Technologies Used

### Backend

- **Node.js** - JavaScript runtime
- **Express** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Nodemailer** - For sending email notifications
- **bcrypt** - For password hashing
- **JWT** - For authentication

### Frontend

- **EJS** - Templating engine
- **Bootstrap 5** - CSS framework
- **Font Awesome** - Icon toolkit
- **jQuery** - JavaScript library
- **AJAX** - For asynchronous requests

## 📂 Project Structure

```
Steph Logicstics ltd/
├── app.js                 # Main application entry point
├── routes/                # Route definitions
│   ├── index.js           # Main routes
│   ├── service.js         # Service routes
│   ├── franchise.js       # Franchise routes
│   └── ...
├── controllers/           # Route controllers
│   ├── service.js         # Service controllers
│   └── ...
├── models/                # Database models
│   ├── Franchise.js       # Franchise model
│   └── ...
├── middleware/            # Middleware functions
│   ├── auth.js            # Authentication middleware
│   └── ...
├── config/                # Configuration files
│   ├── email.js           # Email configuration
│   └── ...
├── views/                 # EJS templates
│   ├── layouts/           # Layout templates
│   ├── service/           # Service pages
│   ├── franchise/         # Franchise pages
│   └── ...
├── public/                # Static files
│   ├── assets/            # Assets (images, etc.)
│   └── ...
├── package.json           # Project dependencies
└── README.md              # Project documentation
```

## 🔄 Recent Implementations

### Franchise Application System

- Added form with validation for franchise applications
- Implemented email notifications for both applicants and administrators
- Added database storage for applications
- Created visual feedback for form submission (loading indicators, success/error messages)

### E-Commerce Integration Service

- Created comprehensive service page with detailed information
- Added platform compatibility information
- Included integration process steps
- Added FAQ section for common questions

### Service Routes

- Fixed routing issues in service pages
- Ensured proper controller structure
- Improved path handling for specific service pages

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository

   ```
   git clone https://github.com/yourusername/shipment-two.git
   cd shipment-two
   ```

2. Install dependencies

   ```
   npm install
   ```

3. Set environment variables
   Create a `.env` file in the root directory and add the following:

   ```
   PORT=3000
   MONGODB_URI=your_mongodb_connection_string
   EMAIL_SERVICE=your_email_service
   EMAIL_USERNAME=your_email_username
   EMAIL_PASSWORD=your_email_password
   JWT_SECRET=your_jwt_secret
   SITE_URL=http://localhost:3000
   ```

4. Start the application

   ```
   npm start
   ```

   For development with auto-reload:

   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Contributors

- [Jephthah Imade](https://github.com/Chris-Imade)

## 🙏 Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Bootstrap](https://getbootstrap.com/)
- [Font Awesome](https://fontawesome.com/)
