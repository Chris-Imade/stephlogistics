/**
 * Steph Logistics Utility Functions
 * Contains common utility functions used across the website
 */

// Create toast container if it doesn't exist
function createToastContainer() {
  if (!document.getElementById("toast-container")) {
    const toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    document.body.appendChild(toastContainer);
  }
  return document.getElementById("toast-container");
}

// Show toast notification
function showToast(message, type = "success") {
  const container = createToastContainer();
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <i class="fas ${
        type === "success" ? "fa-check-circle" : "fa-exclamation-circle"
      } toast-icon"></i>
      <span class="toast-message">${message}</span>
    </div>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add("show");
  }, 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Animate stat numbers when in viewport
function initializeStatCounters() {
  const stats = document.querySelectorAll(".stat-number");
  stats.forEach((stat) => {
    const targetValue = parseInt(stat.getAttribute("data-count"));
    let currentValue = 0;
    const duration = 2000; // milliseconds
    const increment = targetValue / (duration / 16);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const timer = setInterval(() => {
              currentValue += increment;
              if (currentValue >= targetValue) {
                clearInterval(timer);
                currentValue = targetValue;
              }
              stat.textContent = Math.round(currentValue);
            }, 16);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(stat);
  });
}

// Setup copy buttons functionality
function setupCopyButtons() {
  document.querySelectorAll(".copy-btn").forEach((button) => {
    // Remove existing listeners to prevent duplicates
    const newButton = button.cloneNode(true);
    button.parentNode.replaceChild(newButton, button);

    newButton.addEventListener("click", function (e) {
      // Stop event propagation
      e.preventDefault();
      e.stopPropagation();

      // Get the text to copy
      const targetId = this.getAttribute("data-clipboard-target");
      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      const textToCopy = targetEl.textContent.trim();

      // Copy to clipboard
      navigator.clipboard
        .writeText(textToCopy)
        .then(() => {
          // Visual feedback
          const originalIcon = this.innerHTML;
          this.innerHTML = '<i class="fa fa-check"></i>';

          setTimeout(() => {
            this.innerHTML = originalIcon;
          }, 1500);

          showToast(`Copied to clipboard: ${textToCopy}`, "success");
        })
        .catch((err) => {
          console.error("Failed to copy text: ", err);
          showToast("Failed to copy to clipboard", "error");
        });
    });
  });
}

// Initialize all components when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Initialize stat counters if they exist
  if (document.querySelector(".stat-number")) {
    initializeStatCounters();
  }

  // Initialize copy buttons if they exist
  if (document.querySelector(".copy-btn")) {
    setupCopyButtons();
  }

  // Add more initializations here as needed
});

// Export functions for use in other scripts
window.showToast = showToast;
window.setupCopyButtons = setupCopyButtons;
