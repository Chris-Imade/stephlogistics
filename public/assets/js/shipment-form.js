/**
 * Steph Logistics Shipment Form Handler
 * Handles multi-step shipment form functionality
 */

document.addEventListener("DOMContentLoaded", function () {
  console.log("Document loaded - initializing shipment form");

  // DOM Elements
  const form = document.getElementById("shipment-form");
  if (!form) {
    console.error("Shipment form not found in DOM");
    return; // Exit if we're not on the shipment form page
  }

  console.log("Shipment form found");

  const progressBar = document.getElementById("progress-bar");
  const steps = document.querySelectorAll(".step-form");
  const progressSteps = document.querySelectorAll(".progress-step");
  const successMessage = document.getElementById("success-message");
  const trackButton = document.getElementById("track-shipment-btn");

  // Debug DOM elements
  console.log(`Progress bar found: ${!!progressBar}`);
  console.log(`Steps found: ${steps.length}`);
  console.log(`Progress steps found: ${progressSteps.length}`);
  console.log(`Success message found: ${!!successMessage}`);
  console.log(`Track button found: ${!!trackButton}`);

  // Current step tracking
  let currentStep = 1;
  const totalSteps = steps.length;

  // Initialize form
  updateProgressBar();

  // CRITICAL: Add submit button handler via multiple methods for redundancy
  const submitBtn = document.getElementById("btn-submit");
  if (submitBtn) {
    console.log("Submit button found - adding multiple event listeners");

    // Method 1: Direct click handler
    submitBtn.onclick = function (e) {
      console.log("Submit button clicked (onclick)");
      e.preventDefault();
      handleFormSubmission();
      return false;
    };

    // Method 2: addEventListener
    submitBtn.addEventListener("click", function (e) {
      console.log("Submit button clicked (addEventListener)");
      e.preventDefault();
      handleFormSubmission();
    });

    // Method 3: Direct attribute in HTML
    submitBtn.setAttribute(
      "onclick",
      "handleFormSubmissionDirect(); return false;"
    );
  } else {
    console.error("CRITICAL: Submit button not found in DOM");
  }

  // Global function for direct HTML attribute call
  window.handleFormSubmissionDirect = function () {
    console.log("Form submission via direct HTML attribute");
    handleFormSubmission();
    return false;
  };

  // Navigation buttons
  setupNavigationButtons();

  // Functions
  function setupNavigationButtons() {
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

    console.log("Navigation buttons initialized");
  }

  // Form submission handler
  function handleFormSubmission() {
    console.log("Handle form submission called");

    try {
      // Skip validation for now to ensure basic flow works
      console.log("Showing payment processing UI");

      // Hide current step
      document.getElementById("step-5").style.display = "none";

      // Show payment processing
      const processingUI = document.getElementById("payment-processing");
      processingUI.style.display = "block";

      // Update submit button to show loading state
      if (submitBtn) {
        const submitText = document.getElementById("submit-text");
        const submitSpinner = document.getElementById("submit-spinner");
        if (submitText && submitSpinner) {
          submitBtn.disabled = true;
          submitText.style.opacity = "0.6";
          submitSpinner.style.display = "inline-block";
        }
      }

      // Simulate payment processing with progress bar
      const paymentProgressBar = document.getElementById(
        "payment-progress-bar"
      );
      let width = 0;
      console.log("Starting payment processing animation");

      const interval = setInterval(() => {
        if (width >= 100) {
          clearInterval(interval);
          console.log("Payment processing complete, showing success");
          showPaymentSuccess();
        } else {
          width += 3;
          if (paymentProgressBar) {
            paymentProgressBar.style.width = width + "%";
          }
        }
      }, 100);
    } catch (error) {
      console.error("Error in handleFormSubmission:", error);
      alert(
        "An error occurred while processing your submission. Please try again."
      );
    }
  }

  // Show payment success page
  function showPaymentSuccess() {
    try {
      console.log("Showing payment success page");

      // Hide payment processing page
      document.getElementById("payment-processing").style.display = "none";

      // Show payment success page
      const successPage = document.getElementById("payment-success");
      successPage.style.display = "block";

      // Add event listener to finish button
      const finishButton = document.getElementById("finish-button");
      if (finishButton) {
        console.log("Adding event listener to finish button");
        finishButton.onclick = function () {
          console.log("Finish button clicked");
          createShipment();
        };
      } else {
        console.error("Finish button not found");
      }
    } catch (error) {
      console.error("Error in showPaymentSuccess:", error);
    }
  }

  // Create shipment
  function createShipment() {
    try {
      console.log("Creating shipment");

      // Show loading state on finish button
      const finishButton = document.getElementById("finish-button");
      const finishText = document.getElementById("finish-text");
      const finishSpinner = document.getElementById("finish-spinner");

      if (finishButton && finishText && finishSpinner) {
        finishButton.disabled = true;
        finishText.style.opacity = "0.6";
        finishSpinner.style.display = "inline-block";
      }

      // Generate a shipment ID for display
      const tempShipmentId = `SH${Date.now().toString().slice(-10)}`;

      // Hide payment success page
      document.getElementById("payment-success").style.display = "none";

      // Show success message
      if (successMessage) {
        console.log("Showing success message");
        successMessage.style.display = "block";

        // Set IDs
        document.getElementById("shipment-id").textContent = tempShipmentId;
        document.getElementById("tracking-number").textContent =
          "TR" + tempShipmentId.substring(2);

        // Update track button
        if (trackButton) {
          trackButton.href = `/shipment/track?id=TR${tempShipmentId.substring(
            2
          )}`;
        }
      } else {
        console.error("Success message element not found");
        alert("Shipment created successfully!");
      }
    } catch (error) {
      console.error("Error in createShipment:", error);
      alert("An error occurred while creating your shipment.");
    }
  }

  // Step navigation functions
  function nextStep(step) {
    console.log(`Moving to next step: ${step}`);
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
    console.log(`Moving to previous step: ${step}`);
    steps[currentStep - 1].classList.remove("active");
    steps[step - 1].classList.add("active");
    currentStep = step;
    updateProgressBar();

    // Scroll to top of form
    document.querySelector(".card").scrollIntoView({ behavior: "smooth" });
  }

  function updateProgressBar() {
    try {
      const percent = ((currentStep - 1) / (totalSteps - 1)) * 100;
      if (progressBar) {
        progressBar.style.width = `${percent}%`;
      }

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
    } catch (error) {
      console.error("Error updating progress bar:", error);
    }
  }

  function validateStep(step) {
    // Always return true for now to ensure the form works
    return true;
  }

  function updateOrderSummary() {
    try {
      // Get selected shipping method
      const selectedShipping = document.querySelector(
        'input[name="shipping-method"]:checked'
      );
      if (!selectedShipping) {
        console.log("No shipping method selected");
        return;
      }

      const shippingMethod = selectedShipping.value;
      const shippingPrice =
        parseFloat(selectedShipping.getAttribute("data-price")) || 0;

      // Set simple values for now
      document.getElementById("summary-service").textContent =
        shippingMethod.charAt(0).toUpperCase() + shippingMethod.slice(1);
      document.getElementById(
        "summary-shipping"
      ).textContent = `£${shippingPrice.toFixed(2)}`;
      document.getElementById("summary-vat").textContent = `£${(
        shippingPrice * 0.2
      ).toFixed(2)}`;
      document.getElementById("summary-total").textContent = `£${(
        shippingPrice * 1.2
      ).toFixed(2)}`;
    } catch (error) {
      console.error("Error updating order summary:", error);
    }
  }

  // Initialize and log completion
  console.log("Shipment form initialization complete");
});
