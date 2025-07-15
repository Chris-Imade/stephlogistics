console.log(
  "<------------ assets/js/stripe-payment loaded successfully ------------>"
);

function showMessage(msg, isError = true, timeout = 5000) {
  const status = document.getElementById("payment-status");
  if (!status) return;
  status.textContent = msg;
  status.style.color = isError ? "red" : "green";

  if (timeout > 0) {
    setTimeout(() => {
      status.textContent = "";
      status.style.color = "";
    }, timeout);
  }
}

function setButtonLoading(button, isLoading) {
  if (!button) return;
  button.disabled = isLoading;
  button.querySelector(".spinner").style.display = isLoading
    ? "inline-block"
    : "none";
  button.querySelector(".button-text").style.display = isLoading
    ? "none"
    : "inline";
}

const stripePublicKey = document.querySelector(
  "meta[name='stripe-public-key']"
).content;
console.log("Pub Key accessed from client side: ", stripePublicKey);
const stripe = Stripe(stripePublicKey);

const stripeButton = document.getElementById("stripe-button");
stripeButton?.addEventListener("click", async () => {
  setButtonLoading(stripeButton, true);
  showMessage("Processing payment... Please wait.", false);
  const paymentDetailsContainer = document.getElementById(
    "payment-details-container"
  );
  // Hide PayPal container and show Stripe elements
  document.getElementById("paypal-button-container").style.display = "none";
  document.getElementById("payment-element").style.display = "block"; // Ensure Stripe element container is visible
  paymentDetailsContainer.style.display = "block";

  try {
    const shipmentData = window.collectFormData?.();
    const amount = window.calculateTotalAmount?.();

    if (!shipmentData || !amount) {
      showMessage("Form data or amount is missing.");
      setButtonLoading(stripeButton, false);
      return;
    }

    // 1. Create shipment
    const shipmentRes = await fetch("/api/shipments/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(shipmentData),
    });

    if (!shipmentRes.ok) {
      showMessage("Failed to create shipment.");
      setButtonLoading(stripeButton, false);
      return;
    }

    const { shipment } = await shipmentRes.json();
    const shipmentId = shipment.id;

    // 2. Create payment intent
    const paymentRes = await fetch("/payment/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipmentId, provider: "stripe", amount }),
    });

    if (!paymentRes.ok) {
      showMessage("Failed to create payment intent.");
      setButtonLoading(stripeButton, false);
      return;
    }

    const { data } = await paymentRes.json();
    const { clientSecret } = data;

    if(clientSecret) {
      // Proceed with payment
      
    }

    if (!clientSecret) {
      showMessage("Stripe client secret missing.");
      setButtonLoading(stripeButton, false);
      return;
    }

    // 3. Mount Stripe payment element
    const elements = stripe.elements({ clientSecret });
    console.log("Stripe clientSecret:", clientSecret);

    const existing = document.querySelector("#payment-element > *");
    if (existing) existing.remove();

    const paymentElement = elements.create("payment");
    paymentElement.mount("#payment-element");

    // Store elements and shipmentId for later use by the form submission
    window.stripeElementsInstance = elements;
    window.stripeShipmentId = shipmentId;

    // Show the confirm payment button
    const stripeSubmitButton = document.getElementById("submit-stripe-payment");
    if (stripeSubmitButton) {
      stripeSubmitButton.style.display = "inline-block";
    }

    showMessage("Stripe payment form loaded. Please complete payment.", false);
  } catch (err) {
    console.error("Stripe Error:", err);
    showMessage("An error occurred during payment.");
  } finally {
    setButtonLoading(stripeButton, false);
  }
});

// Handle the Stripe payment submission
const stripeSubmitButton = document.getElementById("submit-stripe-payment");
stripeSubmitButton?.addEventListener("click", async (e) => {
  e.preventDefault();
  setButtonLoading(stripeSubmitButton, true);
  showMessage("Confirming payment... Please wait.", false);

  const { stripeElementsInstance, stripeShipmentId } = window;

  if (!stripeElementsInstance || !stripeShipmentId) {
    showMessage("Stripe elements not initialized.");
    setButtonLoading(stripeSubmitButton, false);
    return;
  }

  try {
    const { error } = await stripe.confirmPayment({
      elements: stripeElementsInstance,
      confirmParams: {
        return_url: `${window.location.origin}/payment/success?shipmentId=${stripeShipmentId}`,
      },
    });

    if (error) {
      showMessage(error.message);
      setButtonLoading(stripeSubmitButton, false);
    } else {
      showMessage("Payment successful! Redirecting...", false);
      // The user will be redirected automatically by Stripe.
    }
  } catch (err) {
    console.error("Stripe Confirmation Error:", err);
    showMessage("An error occurred during payment confirmation.");
    setButtonLoading(stripeSubmitButton, false);
  }
});
