"use client"

import { useEffect, useState, useRef } from "react"

/**
 * A hook that safely uses ResizeObserver to prevent the "ResizeObserver loop completed with undelivered notifications" error
 * @param callback The callback to run when resize is detected
 * @returns A ref to attach to the element to observe
 */
export function useSafeResizeObserver<T extends HTMLElement>(callback?: (entry: ResizeObserverEntry) => void) {
  const [width, setWidth] = useState<number | undefined>(undefined)
  const [height, setHeight] = useState<number | undefined>(undefined)
  const elementRef = useRef<T | null>(null)
  const observerRef = useRef<ResizeObserver | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Clean up any existing observer
    if (observerRef.current) {
      observerRef.current.disconnect()
    }

    // Clean up any existing animation frame
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current)
    }

    // Create a new observer
    observerRef.current = new ResizeObserver((entries) => {
      // Use requestAnimationFrame to throttle callbacks and avoid the loop error
      rafRef.current = requestAnimationFrame(() => {
        if (!entries.length) return

        const entry = entries[0]

        // Update dimensions
        setWidth(entry.contentRect.width)
        setHeight(entry.contentRect.height)

        // Call the callback if provided
        if (callback) {
          callback(entry)
        }
      })
    })

    // Observe the element if it exists
    if (elementRef.current) {
      observerRef.current.observe(elementRef.current)
    }

    // Clean up on unmount
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [callback])

  return { ref: elementRef, width, height }
}
