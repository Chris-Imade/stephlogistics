// Shipment options selection handler
document.addEventListener("DOMContentLoaded", function () {
  console.log("Shipment selection handler loaded");

  // Fix for shipping options selection
  const shippingOptions = document.querySelectorAll(".shipping-option");
  if (shippingOptions.length > 0) {
    console.log(
      `Found ${shippingOptions.length} shipping options - adding event listeners`
    );

    shippingOptions.forEach((option) => {
      option.addEventListener("click", function () {
        console.log(
          "Shipping option clicked:",
          this.getAttribute("data-option")
        );

        // Get the radio button inside this option
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;
          console.log("Radio selected:", radio.value);

          // Update visual selection
          shippingOptions.forEach((opt) => opt.classList.remove("selected"));
          this.classList.add("selected");

          // Update order summary if we're on step 5
          const step5 = document.getElementById("step-5");
          if (step5 && step5.classList.contains("active")) {
            try {
              updateOrderSummary();
            } catch (e) {
              console.error("Error updating order summary:", e);
            }
          }
        } else {
          console.error("Radio input not found in shipping option");
        }
      });
    });

    // Add initial selection to first option
    if (shippingOptions[0]) {
      const firstRadio = shippingOptions[0].querySelector(
        'input[type="radio"]'
      );
      if (firstRadio) {
        firstRadio.checked = true;
        shippingOptions[0].classList.add("selected");
      }
    }
  } else {
    console.log("No shipping options found on this page");
  }

  // Also add handlers for payment methods
  const paymentMethods = document.querySelectorAll(".payment-method");
  if (paymentMethods.length > 0) {
    console.log(
      `Found ${paymentMethods.length} payment methods - adding event listeners`
    );

    const cardFields = document.getElementById("card-payment-fields");
    const paypalFields = document.getElementById("paypal-payment-fields");

    paymentMethods.forEach((method) => {
      method.addEventListener("click", function () {
        console.log(
          "Payment method clicked:",
          this.getAttribute("data-method")
        );

        // Get the radio button inside this method
        const radio = this.querySelector('input[type="radio"]');
        if (radio) {
          radio.checked = true;

          // Update visual selection
          paymentMethods.forEach((m) => m.classList.remove("selected"));
          this.classList.add("selected");

          // Show/hide appropriate fields
          if (cardFields && paypalFields) {
            const methodType = this.getAttribute("data-method");
            if (methodType === "card") {
              cardFields.style.display = "block";
              paypalFields.style.display = "none";
            } else if (methodType === "paypal") {
              cardFields.style.display = "none";
              paypalFields.style.display = "block";
            }
          }
        }
      });
    });

    // Add initial selection to first payment method
    if (paymentMethods[0]) {
      paymentMethods[0].classList.add("selected");
    }
  }

  // Add handler for insurance checkbox
  const insuranceCheckbox = document.getElementById("insurance");
  const insuranceValueGroup = document.getElementById("insurance-value-group");

  if (insuranceCheckbox && insuranceValueGroup) {
    insuranceCheckbox.addEventListener("change", function () {
      insuranceValueGroup.classList.toggle("hidden", !this.checked);

      // Update order summary if we're on step 5
      const step5 = document.getElementById("step-5");
      if (step5 && step5.classList.contains("active")) {
        try {
          updateOrderSummary();
        } catch (e) {
          console.error("Error updating order summary:", e);
        }
      }
    });
  }

  // Add handler for same-as-origin checkbox
  const sameAsOriginCheckbox = document.getElementById("same-as-origin");
  const destinationFields = document.getElementById(
    "destination-address-fields"
  );

  if (sameAsOriginCheckbox && destinationFields) {
    sameAsOriginCheckbox.addEventListener("change", function () {
      destinationFields.style.display = this.checked ? "none" : "block";

      if (this.checked) {
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
      }
    });
  }

  // Saturday delivery checkbox handler
  const saturdayDelivery = document.getElementById("saturday-delivery");
  if (saturdayDelivery) {
    saturdayDelivery.addEventListener("change", function () {
      // Update order summary if we're on step 5
      const step5 = document.getElementById("step-5");
      if (step5 && step5.classList.contains("active")) {
        try {
          updateOrderSummary();
        } catch (e) {
          console.error("Error updating order summary:", e);
        }
      }
    });
  }
});

// Helper function for Order Summary
function updateOrderSummary() {
  console.log("Updating order summary");

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

  // Calculate additional costs
  const saturdayDelivery =
    document.getElementById("saturday-delivery")?.checked;
  const saturdayPrice = saturdayDelivery ? 12.5 : 0;

  // Calculate insurance if checked
  const insurance = document.getElementById("insurance")?.checked;
  let insurancePrice = 0;

  if (insurance) {
    const declaredValue =
      parseFloat(document.getElementById("declared-value")?.value) || 0;
    insurancePrice = declaredValue * 0.02; // 2% of declared value
  }

  // Calculate subtotal and VAT
  const subtotal = shippingPrice + saturdayPrice + insurancePrice;
  const vat = subtotal * 0.2; // 20% VAT
  const total = subtotal + vat;

  // Update summary elements
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
  document.getElementById("summary-total").textContent = `£${total.toFixed(2)}`;

  console.log("Order summary updated successfully");
}
