/**
 * Steph Logistics Tracking Form Handler
 * Handles shipment tracking functionality
 */

document.addEventListener("DOMContentLoaded", function () {
  const trackingForm = document.getElementById("tracking-form");
  if (!trackingForm) return; // Exit if we're not on the tracking page

  const trackingInput = document.getElementById("trackingNumber");
  const resultSection = document.querySelector(".tracking-result-section");
  const submitButton = document.querySelector(".track-button");
  const originalButtonText = submitButton ? submitButton.textContent : "Track";

  // Initially hide result section if it exists
  if (resultSection) {
    resultSection.style.display = "none";
  }

  // Setup copy buttons if shipment is displayed
  if (typeof window.setupCopyButtons === "function") {
    window.setupCopyButtons();
  }

  trackingForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const trackingNumber = trackingInput.value.trim();

    if (!trackingNumber) {
      trackingInput.classList.add("error");
      return;
    }

    // Update button state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Searching...";
    }

    // Fetch shipment details from server
    fetch(`/shipment/track?id=${trackingNumber}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Shipment not found");
        }
        return response.text();
      })
      .then((html) => {
        // Redirect to the track result page
        window.location.href = `/shipment/track?id=${trackingNumber}`;
      })
      .catch((error) => {
        console.error("Error tracking shipment:", error);

        if (typeof window.showToast === "function") {
          window.showToast(
            "Shipment not found. Please check the tracking number.",
            "error"
          );
        }
      })
      .finally(() => {
        // Reset button state
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = originalButtonText;
        }
      });
  });
});
