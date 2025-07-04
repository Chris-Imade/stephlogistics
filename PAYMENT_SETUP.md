# Payment Integration Setup Guide

This guide will help you set up the payment integration for the Steph Logistics shipment creation system.

## Prerequisites

1. Node.js and npm installed
2. MongoDB running
3. Stripe account (for payment processing)
4. SMTP email service configured

## Installation Steps

### 1. Install Dependencies

```bash
npm install stripe
```

The Stripe package has already been added to package.json, so you can also run:

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

#### Required Payment Variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLIC_KEY=pk_test_... # Your Stripe publishable key

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Configuration
ADMIN_EMAIL=admin@stephlogistics.co.uk
```

### 3. Stripe Account Setup

1. **Create a Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:

   - Go to Developers > API keys in your Stripe dashboard
   - Copy the "Publishable key" and "Secret key"
   - Use the test keys for development (they start with `pk_test_` and `sk_test_`)

3. **Test Mode**: Make sure you're in test mode during development

### 4. Email Configuration

For Gmail SMTP:

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for the application
3. Use the app password in the `SMTP_PASS` environment variable

### 5. Start the Application

```bash
npm run dev
```

## How the Payment Flow Works

### 1. User Journey

1.  The user navigates through a 5-step shipment creation form.
2.  On the final step, the user selects a payment method (Stripe or PayPal).
3.  If Stripe is selected, the Stripe payment element is dynamically loaded.
4.  The user enters their payment details and submits the form.
5.  The payment is processed by Stripe.
6.  Upon successful payment, the user is redirected to a success page with their shipment details.

### 2. Technical Flow

The payment flow is handled by two main scripts on the frontend: `shipment-form.js` and `stripe-payment.js`.

**`shipment-form.js`:**

*   Manages the multi-step form navigation.
*   Handles form validation at each step.
*   Exposes two global functions, `window.collectFormData()` and `window.calculateTotalAmount()`, which are used by `stripe-payment.js` to get the necessary data for creating a shipment and payment intent.

**`stripe-payment.js`:**

*   This script is loaded as a module on the `create-shipment` page.
*   It uses the `@stripe/stripe-js` library to load Stripe.js asynchronously.
*   When the user clicks the "Stripe" button:
    1.  It calls `window.collectFormData()` and `window.calculateTotalAmount()` to get the shipment and payment data.
    2.  It makes a `POST` request to `/api/shipments/create` to create a new shipment in the database.
    3.  It makes a `POST` request to `/payment/create` to create a new payment intent with Stripe.
    4.  It uses the `clientSecret` from the payment intent to initialize and mount the Stripe payment element.
*   When the user submits the form:
    1.  It calls `stripe.confirmPayment()` to process the payment.
    2.  On success, Stripe redirects the user to the `return_url` specified during payment confirmation (`/payment/success.html`).

### 3. API Endpoints

-   `POST /api/shipments/create`: Creates a new shipment and returns the shipment ID.
-   `POST /payment/create`: Creates a new payment intent and returns the client secret.
-   `GET /payment/success.html`: The success page displayed to the user after a successful payment.

## Testing

### Test Card Numbers (Stripe Test Mode)

- **Successful payment**: `4242424242424242`
- **Declined payment**: `4000000000000002`
- **Requires authentication**: `4000002500003155`

Use any future expiry date and any 3-digit CVC.

### Test Flow

1. Go to `/shipment/create`
2. Fill out the form with test data
3. Use a test card number
4. Complete the payment flow
5. Check that:
   - Payment is p# Payment Integration Setup Guide

This guide will help you set up the payment integration for the Steph Logistics shipment creation system.

## Prerequisites

1. Node.js and npm installed
2. MongoDB running
3. Stripe account (for payment processing)
4. SMTP email service configured

## Installation Steps

### 1. Install Dependencies

```bash
npm install stripe
```

The Stripe package has already been added to package.json, so you can also run:

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in the required values:

```bash
cp .env.example .env
```

#### Required Payment Variables:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe secret key
STRIPE_PUBLIC_KEY=pk_test_... # Your Stripe publishable key

# SMTP Configuration (for email notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Admin Configuration
ADMIN_EMAIL=admin@stephlogistics.co.uk
```

### 3. Stripe Account Setup

1. **Create a Stripe Account**: Go to [stripe.com](https://stripe.com) and create an account
2. **Get API Keys**:

   - Go to Developers > API keys in your Stripe dashboard
   - Copy the "Publishable key" and "Secret key"
   - Use the test keys for development (they start with `pk_test_` and `sk_test_`)

3. **Test Mode**: Make sure you're in test mode during development

### 4. Email Configuration

For Gmail SMTP:

1. Enable 2-factor authentication on your Gmail account
2. Generate an "App Password" for the application
3. Use the app password in the `SMTP_PASS` environment variable

### 5. Start the Application

```bash
npm run dev
```

## How the Payment Flow Works

### 1. User Journey

1.  The user navigates through a 5-step shipment creation form.
2.  On the final step, the user selects a payment method (Stripe or PayPal).
3.  If Stripe is selected, the Stripe payment element is dynamically loaded.
4.  The user enters their payment details and submits the form.
5.  The payment is processed by Stripe.
6.  Upon successful payment, the user is redirected to a success page with their shipment details.

### 2. Technical Flow

The payment flow is handled by two main scripts on the frontend: `shipment-form.js` and `stripe-payment.js`.

**`shipment-form.js`:**

*   Manages the multi-step form navigation.
*   Handles form validation at each step.
*   Exposes two global functions, `window.collectFormData()` and `window.calculateTotalAmount()`, which are used by `stripe-payment.js` to get the necessary data for creating a shipment and payment intent.

**`stripe-payment.js`:**

*   This script is loaded as a module on the `create-shipment` page.
*   It uses the `@stripe/stripe-js` library to load Stripe.js asynchronously.
*   When the user clicks the "Stripe" button:
    1.  It calls `window.collectFormData()` and `window.calculateTotalAmount()` to get the shipment and payment data.
    2.  It makes a `POST` request to `/api/shipments/create` to create a new shipment in the database.
    3.  It makes a `POST` request to `/payment/create` to create a new payment intent with Stripe.
    4.  It uses the `clientSecret` from the payment intent to initialize and mount the Stripe payment element.
*   When the user submits the form:
    1.  It calls `stripe.confirmPayment()` to process the payment.
    2.  On success, Stripe redirects the user to the `return_url` specified during payment confirmation (`/payment/success.html`).

### 3. API Endpoints

-   `POST /api/shipments/create`: Creates a new shipment and returns the shipment ID.
-   `POST /payment/create`: Creates a new payment intent and returns the client secret.
-   `GET /payment/success.html`: The success page displayed to the user after a successful payment.

## Testing

### Test Card Numbers (Stripe Test Mode)

- **Successful payment**: `4242424242424242`
- **Declined payment**: `4000000000000002`
- **Requires authentication**: `4000002500003155`

Use any future expiry date and any 3-digit CVC.

### Test Flow

1. Go to `/shipment/create`
2. Fill out the form with test data
3. Use a test card number
4. Complete the payment flow
5. Check that:
   - Payment is processed
   - Shipment is created in database
   - Emails are sent
   - User sees success message with tracking number

## Production Deployment

### 1. Switch to Live Keys

- Replace test Stripe keys with live keys (start with `pk_live_` and `sk_live_`)
- Update `NODE_ENV=production`
- Set up database and other environment variables for production

### 2. Security Considerations

- Ensure HTTPS is enabled
- Validate all input data
- Implement rate limiting
- Set up proper error logging

## Troubleshooting

### Common Issues

1. **"Stripe not available" error**

   - Check that `STRIPE_PUBLIC_KEY` is set in environment
   - Verify Stripe script is loading in the browser

2. **Payment intent creation fails**

   - Verify `STRIPE_SECRET_KEY` is correct
   - Check server logs for detailed error messages

3. **Emails not sending**

   - Verify SMTP credentials
   - Check that Gmail app password is correct
   - Ensure 2FA is enabled on Gmail account

4. **Database connection issues**
   - Verify MongoDB is running
   - Check `MONGODB_URI` in environment variables

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show detailed console logs for payment processing and shipment creation.

## Support

For issues with:

- **Stripe Integration**: Check [Stripe Documentation](https://stripe.com/docs)
- **Email Setup**: Verify SMTP settings and credentials
- **Database Issues**: Ensure MongoDB is running and accessible

## Security Notes

- Never expose secret keys in client-side code
- Always validate payment on the server side
- Use HTTPS in production
- Implement proper error handling
- Log payment events for audit purposes
ocessed
   - Shipment is created in database
   - Emails are sent
   - User sees success message with tracking number

## Production Deployment

### 1. Switch to Live Keys

- Replace test Stripe keys with live keys (start with `pk_live_` and `sk_live_`)
- Update `NODE_ENV=production`
- Set up database and other environment variables for production

### 2. Security Considerations

- Ensure HTTPS is enabled
- Validate all input data
- Implement rate limiting
- Set up proper error logging

## Troubleshooting

### Common Issues

1. **"Stripe not available" error**

   - Check that `STRIPE_PUBLIC_KEY` is set in environment
   - Verify Stripe script is loading in the browser

2. **Payment intent creation fails**

   - Verify `STRIPE_SECRET_KEY` is correct
   - Check server logs for detailed error messages

3. **Emails not sending**

   - Verify SMTP credentials
   - Check that Gmail app password is correct
   - Ensure 2FA is enabled on Gmail account

4. **Database connection issues**
   - Verify MongoDB is running
   - Check `MONGODB_URI` in environment variables

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show detailed console logs for payment processing and shipment creation.

## Support

For issues with:

- **Stripe Integration**: Check [Stripe Documentation](https://stripe.com/docs)
- **Email Setup**: Verify SMTP settings and credentials
- **Database Issues**: Ensure MongoDB is running and accessible

## Security Notes

- Never expose secret keys in client-side code
- Always validate payment on the server side
- Use HTTPS in production
- Implement proper error handling
- Log payment events for audit purposes
