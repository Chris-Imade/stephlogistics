function submitQuoteForm(event) {
  event.preventDefault();

  // Get form elements
  const form = document.getElementById("quoteForm");
  const submitBtn = document.getElementById("quoteSubmitBtn");
  const submitText = document.getElementById("quoteSubmitText");
  const submitSpinner = document.getElementById("quoteSubmitSpinner");
  const feedback = document.getElementById("quote-feedback");
  const feedbackMessage = document.getElementById("quote-message");
  const successIcon = feedback.querySelector(".success-icon");
  const errorIcon = feedback.querySelector(".error-icon");

  // Hide any previous feedback
  feedback.classList.add("d-none");
  successIcon.classList.add("d-none");
  errorIcon.classList.add("d-none");

  // Show loading state
  submitBtn.disabled = true;
  submitText.classList.add("d-none");
  submitSpinner.classList.remove("d-none");

  // Get form data
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  // Send request
  fetch("/quotes/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      // Show feedback
      feedback.classList.remove("d-none");
      if (result.success) {
        feedback.classList.add("success");
        successIcon.classList.remove("d-none");
        form.reset();
      } else {
        feedback.classList.add("error");
        errorIcon.classList.remove("d-none");
      }
      feedbackMessage.textContent = result.message;
    })
    .catch((error) => {
      // Show error feedback
      feedback.classList.remove("d-none");
      feedback.classList.add("error");
      errorIcon.classList.remove("d-none");
      feedbackMessage.textContent = "An error occurred. Please try again.";
    })
    .finally(() => {
      // Reset button state
      submitBtn.disabled = false;
      submitText.classList.remove("d-none");
      submitSpinner.classList.add("d-none");
    });
}
