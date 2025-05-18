"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getFirebaseAuth } from "../lib/firebase-client"

// Create a context for Firebase Auth
interface FirebaseAuthContextType {
  auth: any | null
  isInitialized: boolean
  isInitializing: boolean
  error: Error | null | unknown
}

const FirebaseAuthContext = createContext<FirebaseAuthContextType>({
  auth: null,
  isInitialized: false,
  isInitializing: false,
  error: null,
})

// Hook to use Firebase Auth context
export const useFirebaseAuth = () => useContext(FirebaseAuthContext)

// Firebase Auth provider component
export function FirebaseAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState({
    auth: null as any,
    isInitialized: false,
    isInitializing: true,
    error: null as Error | null | unknown,
  })

  useEffect(() => {
    let isMounted = true

    const initAuth = async () => {
      try {
        const auth = await getFirebaseAuth()

        if (!isMounted) return

        setState({
          auth,
          isInitialized: !!auth,
          isInitializing: false,
          error: auth ? null : new Error("Failed to initialize Firebase Auth"),
        })
      } catch (error) {
        if (isMounted) {
          setState({
            auth: null,
            isInitialized: false,
            isInitializing: false,
            error,
          })
        }
      }
    }

    initAuth()

    return () => {
      isMounted = false
    }
  }, [])

  return <FirebaseAuthContext.Provider value={state}>{children}</FirebaseAuthContext.Provider>
}

// Component that waits for Firebase Auth to initialize
export function FirebaseAuthInitializer({ children, fallback }: { children: ReactNode; fallback?: ReactNode }) {
  const { isInitialized, isInitializing, error } = useFirebaseAuth()

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Firebase Auth Error</h3>
        <p className="text-sm text-red-600">{error instanceof Error ? error.message : String(error)}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!isInitialized && !isInitializing) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <h3 className="text-lg font-medium text-yellow-800">Authentication Not Available</h3>
        <p className="text-sm text-yellow-600">
          The authentication service is currently unavailable. Please try again later.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-yellow-600 text-white rounded-md text-sm hover:bg-yellow-700"
        >
          Retry
        </button>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      fallback || (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
          <span className="ml-2 text-amber-700">Loading authentication...</span>
        </div>
      )
    )
  }

  return <>{children}</>
}
