/**
 * Steph Logistics Shipment Form Handler
 * Handles multi-step shipment form functionality
 */

document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const form = document.getElementById("shipment-form");
  if (!form) return; // Exit if we're not on the shipment form page

  const progressBar = document.getElementById("progress-bar");
  const steps = document.querySelectorAll(".step-form");
  const progressSteps = document.querySelectorAll(".progress-step");
  const successMessage = document.getElementById("success-message");
  const trackButton = document.getElementById("track-shipment-btn");

  // Initialize track button with a placeholder
  if (trackButton) {
    trackButton.href = "/shipment/track";
  }

  // Current step tracking
  let currentStep = 1;
  const totalSteps = steps.length;

  // Initialize form
  updateProgressBar();

  // Navigation buttons
  document
    .getElementById("btn-step-1")
    ?.addEventListener("click", () => nextStep(2));
  document
    .getElementById("btn-step-2")
    ?.addEventListener("click", () => nextStep(3));
  document
    .getElementById("btn-step-3")
    ?.addEventListener("click", () => nextStep(4));
  document
    .getElementById("btn-step-4")
    ?.addEventListener("click", () => nextStep(5));

  document
    .getElementById("btn-back-1")
    ?.addEventListener("click", () => prevStep(1));
  document
    .getElementById("btn-back-2")
    ?.addEventListener("click", () => prevStep(2));
  document
    .getElementById("btn-back-3")
    ?.addEventListener("click", () => prevStep(3));
  document
    .getElementById("btn-back-4")
    ?.addEventListener("click", () => prevStep(4));

  // Same as origin address checkbox
  const sameAsOriginCheckbox = document.getElementById("same-as-origin");
  const destinationFields = document.getElementById(
    "destination-address-fields"
  );

  if (sameAsOriginCheckbox && destinationFields) {
    sameAsOriginCheckbox.addEventListener("change", function () {
      if (this.checked) {
        destinationFields.style.display = "none";

        // Copy values from origin to destination
        document.getElementById("destination-address").value =
          document.getElementById("origin-address").value;
        document.getElementById("destination-city").value =
          document.getElementById("origin-city").value;
        document.getElementById("destination-postal-code").value =
          document.getElementById("origin-postal-code").value;
        document.getElementById("destination-state").value =
          document.getElementById("origin-state").value;
        document.getElementById("destination-country").value =
          document.getElementById("origin-country").value;
      } else {
        destinationFields.style.display = "block";
      }
    });
  }

  // Insurance checkbox toggle
  const insuranceCheckbox = document.getElementById("insurance");
  const insuranceValueGroup = document.getElementById("insurance-value-group");

  if (insuranceCheckbox && insuranceValueGroup) {
    insuranceCheckbox.addEventListener("change", function () {
      insuranceValueGroup.classList.toggle("hidden", !this.checked);

      if (currentStep === 5) {
        updateOrderSummary();
      }
    });
  }

  // Payment method toggle
  const paymentMethods = document.querySelectorAll(".payment-method");
  const cardFields = document.getElementById("card-payment-fields");
  const paypalFields = document.getElementById("paypal-payment-fields");

  if (paymentMethods.length > 0 && cardFields && paypalFields) {
    const cardInputs = cardFields.querySelectorAll("input");

    paymentMethods.forEach((method) => {
      method.addEventListener("click", function () {
        const methodType = this.getAttribute("data-method");

        // Update radio button
        this.querySelector('input[type="radio"]').checked = true;

        // Toggle selected class
        paymentMethods.forEach((m) => m.classList.remove("selected"));
        this.classList.add("selected");

        // Show/hide appropriate fields
        if (methodType === "card") {
          cardFields.style.display = "block";
          paypalFields.style.display = "none";

          // Make card fields appear required with styling but don't add the attribute yet
          cardInputs.forEach((input) => {
            input.classList.add("card-required");
          });
        } else if (methodType === "paypal") {
          cardFields.style.display = "none";
          paypalFields.style.display = "block";

          // Remove any validation styling for card fields
          cardInputs.forEach((input) => {
            input.classList.remove("is-invalid", "card-required");
            const feedbackEl = input.nextElementSibling;
            if (
              feedbackEl &&
              feedbackEl.classList.contains("invalid-feedback")
            ) {
              feedbackEl.style.display = "none";
            }
          });
        }
      });
    });
  }

  // Shipping options
  const shippingOptions = document.querySelectorAll(".shipping-option");

  if (shippingOptions.length > 0) {
    shippingOptions.forEach((option) => {
      option.addEventListener("click", function () {
        const radio = this.querySelector('input[type="radio"]');
        radio.checked = true;

        shippingOptions.forEach((opt) => opt.classList.remove("selected"));
        this.classList.add("selected");

        if (currentStep === 5) {
          updateOrderSummary();
        }
      });
    });
  }

  // Saturday delivery checkbox
  const saturdayDelivery = document.getElementById("saturday-delivery");
  if (saturdayDelivery) {
    saturdayDelivery.addEventListener("change", function () {
      if (currentStep === 5) {
        updateOrderSummary();
      }
    });
  }

  // Update declared value
  const declaredValue = document.getElementById("declared-value");
  if (declaredValue) {
    declaredValue.addEventListener("input", function () {
      if (currentStep === 5) {
        updateOrderSummary();
      }
    });
  }

  // Form submission
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Check if terms checkbox is checked
      const termsCheckbox = document.getElementById("terms");
      if (termsCheckbox && !termsCheckbox.checked) {
        termsCheckbox.classList.add("is-invalid");
        let feedbackElement = termsCheckbox.nextElementSibling;
        if (
          !feedbackElement ||
          !feedbackElement.classList.contains("invalid-feedback")
        ) {
          feedbackElement = document.createElement("div");
          feedbackElement.className = "invalid-feedback";
          feedbackElement.textContent =
            "You must agree to the terms and conditions";
          termsCheckbox.parentNode.insertBefore(
            feedbackElement,
            termsCheckbox.nextSibling
          );
        }
        feedbackElement.style.display = "block";
        return;
      }

      // Check if PayPal is selected
      const paypalSelected = document.getElementById("payment-paypal")?.checked;

      // If card payment is selected, validate card fields
      if (!paypalSelected) {
        const cardInputs = document.querySelectorAll(
          "#card-payment-fields input"
        );
        let cardFieldsValid = true;

        cardInputs.forEach((input) => {
          // Clear previous validation
          input.classList.remove("is-invalid");
          const feedbackEl = input.nextElementSibling;
          if (feedbackEl && feedbackEl.classList.contains("invalid-feedback")) {
            feedbackEl.style.display = "none";
          }

          // Check if field is empty
          if (!input.value.trim()) {
            cardFieldsValid = false;
            input.classList.add("is-invalid");

            // Add validation message
            let feedbackElement = input.nextElementSibling;
            if (
              !feedbackElement ||
              !feedbackElement.classList.contains("invalid-feedback")
            ) {
              feedbackElement = document.createElement("div");
              feedbackElement.className = "invalid-feedback";
              feedbackElement.textContent = "This field is required";
              input.parentNode.insertBefore(feedbackElement, input.nextSibling);
            }
            feedbackElement.style.display = "block";
          }
        });

        if (!cardFieldsValid) {
          return;
        }
      }

      // Show loading state on submit button
      const submitButton = document.getElementById("btn-submit");
      const submitText = document.getElementById("submit-text");
      const submitSpinner = document.getElementById("submit-spinner");

      submitButton.disabled = true;
      submitText.style.opacity = "0.6";
      submitSpinner.style.display = "inline-block";

      // Show payment processing page
      setTimeout(() => {
        // Hide current step
        steps[currentStep - 1].style.display = "none";
        document.querySelector(".progress-container").style.display = "none";

        // Show payment processing
        document.getElementById("payment-processing").style.display = "block";

        // Simulate payment processing with progress bar
        const progressBar = document.getElementById("payment-progress-bar");
        let width = 0;
        const interval = setInterval(() => {
          if (width >= 100) {
            clearInterval(interval);
            // Always show success
            showPaymentSuccess();
          } else {
            width += 3; // Slower increment for smoother progress
            progressBar.style.width = width + "%";
          }
        }, 100);
      }, 500);
    });
  }

  // Show payment success page
  function showPaymentSuccess() {
    // Hide payment processing page
    document.getElementById("payment-processing").style.display = "none";

    // Show payment success page
    document.getElementById("payment-success").style.display = "block";

    // Add event listener to finish button
    document
      .getElementById("finish-button")
      ?.addEventListener("click", function () {
        createShipment();
      });
  }

  // Create shipment
  function createShipment() {
    // Show loading state on finish button
    const finishButton = document.getElementById("finish-button");
    const finishText = document.getElementById("finish-text");
    const finishSpinner = document.getElementById("finish-spinner");

    finishButton.disabled = true;
    finishText.style.opacity = "0.6";
    finishSpinner.style.display = "inline-block";

    try {
      // Generate a shipment ID for immediate display
      // But we'll use the backend's tracking ID once we get a response
      const timestamp = Date.now();
      const randomPartShipment = Math.floor(Math.random() * 10000000)
        .toString()
        .padStart(7, "0");
      const tempShipmentId = `SH${timestamp}${randomPartShipment}`;

      // Set temporary shipment ID value - will be updated with real value from server
      document.getElementById("shipment-id").textContent = tempShipmentId;
      document.getElementById("tracking-number").textContent = "Processing...";

      // Create the shipment data object
      const shipmentData = {
        // Customer info
        customerName: `${document.getElementById("first-name").value} ${
          document.getElementById("last-name").value
        }`,
        customerEmail:
          document.getElementById("email").value || "customer@example.com",
        customerPhone: document.getElementById("phone").value || "N/A",
        company: document.getElementById("company").value || "Personal",
        reference:
          document.getElementById("reference").value || "Auto-generated",

        // Origins and destination
        origin: `${document.getElementById("origin-address").value}, ${
          document.getElementById("origin-city").value
        }, ${document.getElementById("origin-country").value}`,
        destination: `${
          document.getElementById("destination-address").value
        }, ${document.getElementById("destination-city").value}, ${
          document.getElementById("destination-country").value
        }`,

        // Package details
        packageType:
          document.getElementById("package-type").value || "standard",
        weight: parseFloat(document.getElementById("weight").value) || 1.0,
        dimensions: {
          length: parseFloat(document.getElementById("length").value) || 10,
          width: parseFloat(document.getElementById("width").value) || 10,
          height: parseFloat(document.getElementById("height").value) || 10,
        },
        contents:
          document.getElementById("contents").value || "General merchandise",
        fragile: document.getElementById("fragile").checked,
        insuranceIncluded: document.getElementById("insurance").checked,
        declaredValue: document.getElementById("insurance").checked
          ? parseFloat(document.getElementById("declared-value").value) || 0
          : 0,

        // Shipping options
        carrier: document.querySelector('input[name="shipping-method"]:checked')
          .value,
        expressDelivery:
          document.querySelector('input[name="shipping-method"]:checked')
            .value === "express",
        saturdayDelivery: document.getElementById("saturday-delivery").checked,

        // Payment info
        paymentMethod: document.querySelector(
          'input[name="payment-method"]:checked'
        ).value,

        // Calculate estimated delivery date (5 days from now)
        estimatedDelivery: new Date(
          Date.now() + 5 * 24 * 60 * 60 * 1000
        ).toISOString(),

        // Status
        status: "processing",
      };

      // First hide the payment success page
      document.getElementById("payment-success").style.display = "none";

      // Show the success message with the temporary tracking IDs
      successMessage.style.display = "block";

      // Set up the copy buttons for the IDs
      if (typeof window.setupCopyButtons === "function") {
        window.setupCopyButtons();
      }

      // Then send data to the server
      fetch("/shipment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(shipmentData),
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Server responded with status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data.success) {
            // Update the tracking number with the server-generated one
            document.getElementById("tracking-number").textContent =
              data.trackingId;
            document.getElementById("shipment-id").textContent =
              data.shipmentId;

            // Update the tracking button href with the tracking ID
            const trackButton = document.getElementById("track-shipment-btn");
            trackButton.href = `/shipment/track?id=${data.trackingId}`;

            // Show success toast
            if (typeof window.showToast === "function") {
              window.showToast("Shipment created successfully!", "success");
            }

            // Re-setup copy buttons with updated values
            if (typeof window.setupCopyButtons === "function") {
              window.setupCopyButtons();
            }
          } else {
            // Show warning toast but we already have the IDs displayed
            if (typeof window.showToast === "function") {
              window.showToast(
                data.message ||
                  "Server had issues creating your shipment, but your shipment details are available.",
                "error"
              );
            }
          }
        })
        .catch((error) => {
          console.error("Error creating shipment:", error);

          // Update the tracking number to indicate error
          document.getElementById("tracking-number").textContent =
            "Error - Please try again";

          // Update the track button to point to the normal track page
          const trackButton = document.getElementById("track-shipment-btn");
          trackButton.href = `/shipment/track`;

          // Show error toast with more details
          if (typeof window.showToast === "function") {
            window.showToast(
              "Error creating shipment. Please refresh and try again or contact support.",
              "error"
            );
          }
        })
        .finally(() => {
          // Reset button state
          finishButton.disabled = false;
          finishText.style.opacity = "1";
          finishSpinner.style.display = "none";
        });
    } catch (error) {
      console.error("Error in createShipment function:", error);

      // Show error toast
      if (typeof window.showToast === "function") {
        window.showToast(
          "An unexpected error occurred. Please try again.",
          "error"
        );
      }

      // Reset button state
      finishButton.disabled = false;
      finishText.style.opacity = "1";
      finishSpinner.style.display = "none";
    }
  }

  // Functions
  function nextStep(step) {
    if (validateStep(currentStep)) {
      steps[currentStep - 1].classList.remove("active");
      steps[step - 1].classList.add("active");
      currentStep = step;
      updateProgressBar();

      if (currentStep === 5) {
        updateOrderSummary();
      }

      // Scroll to top of form
      document.querySelector(".card").scrollIntoView({ behavior: "smooth" });
    }
  }

  function prevStep(step) {
    steps[currentStep - 1].classList.remove("active");
    steps[step - 1].classList.add("active");
    currentStep = step;
    updateProgressBar();

    // Scroll to top of form
    document.querySelector(".card").scrollIntoView({ behavior: "smooth" });
  }

  function updateProgressBar() {
    const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
    progressBar.style.width = `${percent}%`;

    // Update progress steps
    progressSteps.forEach((step, index) => {
      const stepNum = index + 1;

      if (stepNum < currentStep) {
        step.classList.add("completed");
        step.classList.remove("active");
      } else if (stepNum === currentStep) {
        step.classList.add("active");
        step.classList.remove("completed");
      } else {
        step.classList.remove("active", "completed");
      }
    });
  }

  function validateStep(step) {
    const currentStepEl = steps[step - 1];
    const requiredFields = currentStepEl.querySelectorAll(
      '[required]:not([type="hidden"])'
    );
    let isValid = true;

    requiredFields.forEach((field) => {
      // Reset validation state
      field.classList.remove("is-invalid");
      const feedbackEl = field.nextElementSibling;
      if (feedbackEl && feedbackEl.classList.contains("invalid-feedback")) {
        feedbackEl.style.display = "none";
      }

      if (!field.checkValidity()) {
        isValid = false;
        field.classList.add("is-invalid");

        // Add validation message if not already present
        let feedbackElement = field.nextElementSibling;
        if (
          !feedbackElement ||
          !feedbackElement.classList.contains("invalid-feedback")
        ) {
          feedbackElement = document.createElement("div");
          feedbackElement.className = "invalid-feedback";
          feedbackElement.textContent =
            field.validationMessage || "This field is required";
          field.parentNode.insertBefore(feedbackElement, field.nextSibling);
        }

        feedbackElement.style.display = "block";
      }
    });

    return isValid;
  }

  function updateOrderSummary() {
    // Get selected shipping method
    const selectedShipping = document.querySelector(
      'input[name="shipping-method"]:checked'
    );
    if (!selectedShipping) return;

    const shippingMethod = selectedShipping.value;
    const shippingPrice = parseFloat(
      selectedShipping.getAttribute("data-price")
    );

    // Calculate additional services
    const saturdayDelivery =
      document.getElementById("saturday-delivery")?.checked;
    const saturdayPrice = saturdayDelivery ? 12.5 : 0;

    // Calculate insurance if checked
    const insurance = document.getElementById("insurance")?.checked;
    let insurancePrice = 0;

    if (insurance) {
      const declaredValue =
        parseFloat(document.getElementById("declared-value").value) || 0;
      insurancePrice = declaredValue * 0.02; // 2% of declared value
    }

    // Calculate subtotal and VAT
    const subtotal = shippingPrice + saturdayPrice + insurancePrice;
    const vat = subtotal * 0.2; // 20% VAT
    const total = subtotal + vat;

    // Update summary
    document.getElementById("summary-service").textContent =
      shippingMethod.charAt(0).toUpperCase() +
      shippingMethod.slice(1) +
      " Delivery";
    document.getElementById(
      "summary-shipping"
    ).textContent = `£${shippingPrice.toFixed(2)}`;

    // Show/hide Saturday delivery row
    const saturdayRow = document.getElementById("summary-row-saturday");
    if (saturdayRow) {
      saturdayRow.style.display = saturdayDelivery ? "flex" : "none";
    }

    // Show/hide insurance row
    const insuranceRow = document.getElementById("summary-row-insurance");
    if (insuranceRow) {
      insuranceRow.style.display = insurance ? "flex" : "none";
      document.getElementById(
        "summary-insurance"
      ).textContent = `£${insurancePrice.toFixed(2)}`;
    }

    document.getElementById("summary-vat").textContent = `£${vat.toFixed(2)}`;
    document.getElementById("summary-total").textContent = `£${total.toFixed(
      2
    )}`;
  }

  // Initialize first shipping option as selected
  if (shippingOptions.length > 0) {
    shippingOptions[0].click();
  }

  // Initialize first payment method as selected
  if (paymentMethods.length > 0) {
    paymentMethods[0].classList.add("selected");
  }
});
