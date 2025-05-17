"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Server-side error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="mb-4 text-gray-700">
          An error occurred on the server. This could be due to a temporary issue or a problem with the application.
        </p>
        {error.message && (
          <div className="p-3 bg-gray-100 rounded-md mb-4 overflow-auto">
            <p className="font-mono text-sm text-gray-800">{error.message}</p>
          </div>
        )}
        {error.digest && (
          <div className="p-3 bg-gray-100 rounded-md mb-4">
            <p className="font-mono text-sm text-gray-600">Error ID: {error.digest}</p>
          </div>
        )}
        <div className="flex gap-4">
          <Button
            onClick={() => {
              try {
                if (typeof reset === "function") {
                  reset()
                } else {
                  window.location.reload()
                }
              } catch (e) {
                console.error("Error during reset:", e)
                window.location.reload()
              }
            }}
          >
            Try again
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              window.location.href = "/"
            }}
          >
            Return to Home
          </Button>
        </div>
      </div>
    </div>
  )
}
