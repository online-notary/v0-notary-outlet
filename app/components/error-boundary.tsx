"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
    this.setState({ errorInfo })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="mb-4 text-gray-700">
              An error occurred while rendering this page. This could be due to a temporary issue or a problem with the
              application.
            </p>
            {this.state.error && (
              <div className="p-3 bg-gray-100 rounded-md mb-4 overflow-auto">
                <p className="font-mono text-sm text-gray-800">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-sm text-gray-600 cursor-pointer">Stack trace</summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-200 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null })
                  window.location.reload()
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

    return this.props.children
  }
}
