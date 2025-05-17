// This file provides a polyfill/patch for ResizeObserver to prevent the loop error
if (typeof window !== "undefined") {
  // Store the original error handler
  const originalOnError = window.onerror

  // Override the error handler to catch and handle ResizeObserver errors
  window.onerror = function (message, source, lineno, colno, error) {
    // Check if the error is related to ResizeObserver
    if (message && message.toString().includes("ResizeObserver")) {
      // Prevent the error from propagating
      console.warn("ResizeObserver error suppressed:", message)
      return true // Prevents the error from being displayed in the console
    }

    // Call the original error handler for other errors
    if (originalOnError) {
      return originalOnError.call(this, message, source, lineno, colno, error)
    }

    return false
  }
}

export {}
