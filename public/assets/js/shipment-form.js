/**
 * Steph Logistics Shipment Form Handler
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Initializing shipment form...");

  // DOM Elements
  const form = document.getElementById("shipment-form");
  if (!form) {
    console.error("Shipment form not found!");
    return;
  }

  const progressBar = document.getElementById("progress-bar");
  const steps = document.querySelectorAll(".step-form");
  const progressSteps = document.querySelectorAll(".progress-step");

  let currentStep = 1;
  const totalSteps = steps.length;

  // --- UTILITY FUNCTIONS ---

  function updateProgressBar() {
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    if (progressBar) {
      progressBar.style.width = `${percent}%`;
    }
    progressSteps.forEach((step, index) => {
      const stepNum = index + 1;
      step.classList.toggle("active", stepNum === currentStep);
      step.classList.toggle("completed", stepNum < currentStep);
    });
  }

  function showStep(stepNumber) {
    steps.forEach((step) => step.classList.remove("active"));
    const targetStep = document.getElementById(`step-${stepNumber}`);
    if (targetStep) {
      targetStep.classList.add("active");
    }
  }

  function validateStep(step) {
    const currentStepElement = document.getElementById(`step-${step}`);
    if (!currentStepElement) return false;
    const requiredFields = currentStepElement.querySelectorAll("[required]");
    for (const field of requiredFields) {
      if (!field.value.trim()) {
        showToast(`Please fill out the ${field.name} field.`);
        return false;
      }
    }
    return true;
  }

  function nextStep(step) {
    if (validateStep(currentStep)) {
      currentStep = step;
      showStep(currentStep);
      updateProgressBar();
    }
  }

  function prevStep(step) {
    currentStep = step;
    showStep(currentStep);
    updateProgressBar();
  }

  function showToast(message, type = "error") {
    const toastContainer =
      document.getElementById("toast-container") || createToastContainer();
    const toast = document.createElement("div");
    toast.className = `toast ${type} show`;
    toast.innerHTML = `<div class="toast-content"><div class="toast-message">${message}</div></div>`;
    toastContainer.appendChild(toast);
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 500);
    }, 3000);
  }

  function createToastContainer() {
    const container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
    return container;
  }

  window.collectFormData = function () {
    const packageTypeMapping = {
      envelope: "Document",
      "small-package": "Parcel",
      "medium-package": "Parcel",
      "large-package": "Parcel",
      pallet: "Freight",
    };
    const selectedPackageType = document.getElementById("package-type").value;

    return {
      customerName: `${document.getElementById("first-name").value} ${
        document.getElementById("last-name").value
      }`,
      customerEmail: document.getElementById("email").value,
      customerPhone: document.getElementById("phone").value,
      origin: `${document.getElementById("origin-address").value}, ${
        document.getElementById("origin-city").value
      }, ${document.getElementById("origin-postal-code").value}, ${
        document.getElementById("origin-country").value
      }`,
      destination: `${document.getElementById("destination-address").value}, ${
        document.getElementById("destination-city").value
      }, ${document.getElementById("destination-postal-code").value}, ${
        document.getElementById("destination-country").value
      }`,
      packageType: packageTypeMapping[selectedPackageType] || "Parcel",
      weight: document.getElementById("weight").value,
      dimensions: {
        length: document.getElementById("length").value,
        width: document.getElementById("width").value,
        height: document.getElementById("height").value,
      },
      fragile: document.getElementById("fragile").checked,
      insuranceIncluded: document.getElementById("insurance").checked,
      contents: document.getElementById("contents").value,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    };
  };

  window.calculateTotalAmount = function () {
    const selectedShipping = document.querySelector(
      'input[name="shipping-method"]:checked'
    );
    if (!selectedShipping) return 0;
    const basePrice =
      parseFloat(selectedShipping.getAttribute("data-price")) || 0;
    const saturdayPrice = document.getElementById("saturday-delivery")?.checked
      ? 12.5
      : 0;
    return basePrice + saturdayPrice;
  };

  // --- EVENT LISTENERS ---

  // Navigation
  document.getElementById("btn-step-1").addEventListener("click", () => {
    console.log("Continue from step 1 clicked");
    nextStep(2);
  });
  document.getElementById("btn-step-2").addEventListener("click", () => {
    console.log("Continue from step 2 clicked");
    nextStep(3);
  });
  document.getElementById("btn-step-3").addEventListener("click", () => {
    console.log("Continue from step 3 clicked");
    nextStep(4);
  });
  document.getElementById("btn-step-4").addEventListener("click", () => {
    console.log("Continue from step 4 clicked");
    nextStep(5);
  });

  document.getElementById("btn-back-1").addEventListener("click", () => {
    console.log("Back from step 2 clicked");
    prevStep(1);
  });
  document.getElementById("btn-back-2").addEventListener("click", () => {
    console.log("Back from step 3 clicked");
    prevStep(2);
  });
  document.getElementById("btn-back-3").addEventListener("click", () => {
    console.log("Back from step 4 clicked");
    prevStep(3);
  });
  document.getElementById("btn-back-4").addEventListener("click", () => {
    console.log("Back from step 5 clicked");
    prevStep(4);
  });

  // Payment Method Toggle
  const stripeBtn = document.getElementById("stripe-button");
  const paypalBtn = document.getElementById("paypal-btn");
  const paymentMethodInput = document.getElementById("payment-method");
  const submitStripePaymentButton = document.getElementById("submit-stripe-payment");

  stripeBtn.addEventListener("click", () => {
    paymentMethodInput.value = "stripe";
    // Show Stripe payment element and the submit button
    document.getElementById("payment-element").style.display = "block";
    submitStripePaymentButton.style.display = "block";
    // Hide PayPal elements
    document.getElementById("paypal-button-container").style.display = "none";
  });

  paypalBtn.addEventListener("click", () => {
    paymentMethodInput.value = "paypal";
    // Hide Stripe elements and the submit button
    document.getElementById("payment-element").style.display = "none";
    submitStripePaymentButton.style.display = "none";
    // Show PayPal elements (paypal-payment.js handles rendering)
    document.getElementById("paypal-button-container").style.display = "block";
  });

  // Add event listener to the Stripe submit button
  if (submitStripePaymentButton) {
    submitStripePaymentButton.addEventListener("click", async () => {
      // Prevent double submission if already processing
      if (submitStripePaymentButton.disabled) return;

      setButtonLoading(submitStripePaymentButton, true);
      try {
        if (!window.stripeElementsInstance || !window.stripeShipmentId) {
          showMessage("Stripe payment not initialized. Please select Stripe again.", true);
          setButtonLoading(submitStripePaymentButton, false);
          return;
        }

        const { error } = await stripe.confirmPayment({
          elements: window.stripeElementsInstance,
          confirmParams: {
            return_url: `${window.location.origin}/payment/success.html?shipment_id=${window.stripeShipmentId}`,
          },
        });

        if (error) {
          showMessage(error.message || "Stripe payment failed.", true);
        } else {
          showMessage("Stripe payment initiated. Redirecting...", false);
        }
      } catch (err) {
        console.error("Stripe payment submission error:", err);
        showMessage("An unexpected error occurred during Stripe payment.", true);
      } finally {
        setButtonLoading(submitStripePaymentButton, false);
      }
    });
  }

  // Initial setup
  updateProgressBar();
});