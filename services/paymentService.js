/**
 * Payment Service
 * Handles payment processing for shipments
 */

let stripe;
const initializeStripe = () => {
  console.log("[Stripe Debug] Initializing Stripe...");
  if (!stripe) {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    console.log("[Stripe Debug] Stripe key present:", !!stripeKey);
    if (!stripeKey) {
      console.error("[Stripe Debug] Stripe secret key is not configured");
      return null;
    }

    try {
      stripe = require("stripe")(stripeKey);
      console.log("[Stripe Debug] Stripe client initialized successfully");
    } catch (error) {
      console.error("[Stripe Debug] Error initializing Stripe:", error);
      return null;
    }
  }
  return stripe;
};

const paymentProviders = {
  stripe: {
    createPaymentIntent: async (amount, currency, metadata) => {
      try {
        console.log("[Stripe Debug] Creating payment intent...");
        const stripeClient = initializeStripe();
        if (!stripeClient) {
          throw new Error("Stripe is not properly configured");
        }

        const paymentIntent = await stripeClient.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: currency.toLowerCase(),
          metadata,
          automatic_payment_methods: {
            enabled: true,
          },
        });

        console.log(
          "[Stripe Debug] Payment intent created successfully:",
          paymentIntent.id
        );
        return paymentIntent;
      } catch (error) {
        console.error("[Stripe Debug] Payment intent creation error:", {
          message: error.message,
          type: error.type,
          code: error.code,
        });
        throw error;
      }
    },

    confirmPayment: async (paymentIntentId) => {
      try {
        const stripeClient = initializeStripe();
        if (!stripeClient) {
          throw new Error("Stripe is not properly configured");
        }
        const paymentIntent = await stripeClient.paymentIntents.retrieve(
          paymentIntentId
        );
        return paymentIntent;
      } catch (error) {
        console.error("Stripe payment confirmation error:", error);
        throw error;
      }
    },
  },

};

/**
 * Initialize a payment
 * @param {String} provider - Payment provider (stripe or paypal)
 * @param {Object} paymentDetails - Details about the payment
 * @returns {Promise<Object>} Payment initiation results
 */
exports.initiatePayment = async (provider, paymentDetails) => {
  try {
    if (!provider || !paymentDetails) {
      throw new Error("Provider and payment details are required");
    }

    if (!paymentProviders[provider]) {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }

    const {
      amount,
      currency = "USD",
      shipmentId,
      customerEmail,
    } = paymentDetails;

    if (!amount || amount <= 0) {
      throw new Error("Valid payment amount is required");
    }

    // Route to appropriate payment provider
    if (provider === "stripe") {
      return await paymentProviders.stripe.createPaymentIntent(
        amount,
        currency,
        { shipmentId, customerEmail }
      );
    }
  } catch (error) {
    console.error("Payment initiation error:", error);
    throw error;
  }
};

/**
 * Complete a payment
 * @param {String} provider - Payment provider (stripe or paypal)
 * @param {Object} completionDetails - Details required to complete the payment
 * @returns {Promise<Object>} Payment completion results
 */
exports.completePayment = async (provider, completionDetails) => {
  try {
    if (!provider || !completionDetails) {
      throw new Error("Provider and completion details are required");
    }

    if (!paymentProviders[provider]) {
      throw new Error(`Unsupported payment provider: ${provider}`);
    }

    // Route to appropriate payment provider
    if (provider === "stripe") {
      const { paymentIntentId } = completionDetails;
      if (!paymentIntentId) {
        throw new Error("Payment intent ID is required for Stripe");
      }
      return await paymentProviders.stripe.confirmPayment(paymentIntentId);
    }
  } catch (error) {
    console.error("Payment completion error:", error);
    throw error;
  }
};
