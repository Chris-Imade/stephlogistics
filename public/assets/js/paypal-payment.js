const paypalBtn = document.getElementById("paypal-btn");
const paypalContainerWrapper = document.getElementById(
  "paypal-button-container"
);
const paypalContainer = document.querySelector(".paypal-container");
const stripeElements = document.getElementById("payment-element");
const stripeButton = document.getElementById("submit-stripe-payment");
const paymentMethodInput = document.getElementById("payment-method");

console.log(window.paypal, "PayPal SDK loaded:", !!window.paypal);

paypalBtn.addEventListener("click", function () {
  console.log("[PayPal] PayPal button clicked");

  // Set the selected payment method
  paymentMethodInput.value = "paypal";
  console.log("[PayPal] Payment method set to:", paymentMethodInput.value);

  // Show payment section
  document.getElementById("payment-details-container").style.display = "block";
  console.log("[PayPal] Showing payment details container");

  // Hide Stripe elements and show PayPal container
  stripeElements.style.display = "none";
  stripeButton.style.display = "none";
  console.log("[PayPal] Hiding Stripe elements");

  paypalContainerWrapper.style.display = "block";
  console.log("[PayPal] Displaying PayPal button container");

  // Clear existing PayPal buttons to allow re-render
  paypalContainer.innerHTML = "";
  console.log("[PayPal] Rendering PayPal button");

  const shipmentAmount = window.calculateTotalAmount();
  console.log("[PayPal] Calculated shipment amount:", shipmentAmount);

  window.paypal
    .Buttons({
      createOrder: async function (data, actions) {
        console.log("[PayPal] Creating order with amount:", shipmentAmount);
        try {
          const shipmentData = window.collectFormData?.();
          if (!shipmentData || !shipmentAmount) {
            throw new Error("Form data or amount is missing.");
          }

          // 1. Create shipment
          const shipmentRes = await fetch("/api/shipments/create", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(shipmentData),
          });

          if (!shipmentRes.ok) {
            throw new Error("Failed to create shipment.");
          }

          const { shipment } = await shipmentRes.json();
          const shipmentId = shipment.id;

          // Store shipmentId globally or pass it
          window.currentShipmentId = shipmentId;

          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: shipmentAmount.toFixed(2),
                  currency_code: "GBP",
                },
              },
            ],
          });
        } catch (error) {
          console.error("Error creating PayPal order:", error);
          const paymentErrorElement = document.getElementById("payment-error");
          if (paymentErrorElement) {
            paymentErrorElement.textContent = error.message || "Failed to create PayPal order. Please try again.";
            setTimeout(() => {
              paymentErrorElement.textContent = "";
            }, 5000);
          }
          throw error; // Re-throw to stop PayPal flow
        }
      },
      onApprove: async function (data, actions) {
        console.log("[PayPal] Payment approved. Capturing payment...");
        try {
          const details = await actions.order.capture();
          console.log("[PayPal] Payment captured successfully:", details);

          // Update shipment status on backend
          const shipmentId = window.currentShipmentId;
          if (shipmentId) {
            const updateRes = await fetch(`/api/shipments/${shipmentId}/payment-status`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "Paid", paymentDetails: details }),
            });

            if (!updateRes.ok) {
              console.error("Failed to update shipment payment status.");
              // Handle error, but still redirect to success page
            }
          }

          alert("Payment successful! Thank you, " + details.payer.name.given_name);
          window.location.href = `/payment/success.html?shipment_id=${shipmentId}`;
        } catch (error) {
          console.error("[PayPal] Error capturing payment or updating shipment:", error);
          const paymentErrorElement = document.getElementById("payment-error");
          if (paymentErrorElement) {
            paymentErrorElement.textContent = error.message || "An error occurred during payment capture. Please try again.";
            setTimeout(() => {
              paymentErrorElement.textContent = "";
            }, 5000);
          }
        }
      },
        onError: function (err) {
          console.error("[PayPal] Error occurred during payment:", err);
          const paymentErrorElement = document.getElementById("payment-error");
          if (paymentErrorElement) {
            paymentErrorElement.textContent = "An error occurred with PayPal. Please try again.";
            setTimeout(() => {
              paymentErrorElement.textContent = "";
            }, 5000); // Clear message after 5 seconds
          }
        },
      })
      .render(".paypal-container");
});
