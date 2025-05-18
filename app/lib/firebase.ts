"use client"

import { useState, useEffect } from "react"

// Track initialization state
let isInitializing = false
let isInitialized = false
let initError: Error | null = null

// Firebase app instance and services
let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null
let firebaseStorage: any = null

// Create a promise that resolves when Firebase is initialized
let initPromise: Promise<boolean> | null = null
let initPromiseResolve: ((value: boolean) => void) | null = null
let initPromiseReject: ((reason: any) => void) | null = null

// Initialize the promise
if (typeof window !== "undefined") {
  initPromise = new Promise<boolean>((resolve, reject) => {
    initPromiseResolve = resolve
    initPromiseReject = reject
  })
}

// Initialize Firebase
async function initializeFirebase() {
  // Prevent multiple initialization attempts
  if (isInitializing || isInitialized) return initPromise

  isInitializing = true
  console.log("Starting Firebase initialization...")

  try {
    // Dynamically import Firebase modules
    const { initializeApp, getApps } = await import("firebase/app")
    const { getAuth } = await import("firebase/auth")
    const { getFirestore } = await import("firebase/firestore")
    const { getStorage } = await import("firebase/storage")

    // Firebase configuration
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    }

    // Check if Firebase is already initialized
    if (getApps().length === 0) {
      console.log("Initializing Firebase app...")
      firebaseApp = initializeApp(firebaseConfig)
    } else {
      console.log("Firebase app already initialized")
      firebaseApp = getApps()[0]
    }

    // Initialize Firebase services with proper error handling
    try {
      console.log("Initializing Firebase Auth...")
      firebaseAuth = getAuth(firebaseApp)
      console.log("Firebase Auth initialized successfully")
    } catch (authError) {
      console.error("Error initializing Firebase Auth:", authError)
      throw authError
    }

    try {
      console.log("Initializing Firebase Firestore...")
      firebaseDb = getFirestore(firebaseApp)
      console.log("Firebase Firestore initialized successfully")
    } catch (firestoreError) {
      console.error("Error initializing Firebase Firestore:", firestoreError)
      throw firestoreError
    }

    try {
      console.log("Initializing Firebase Storage...")
      firebaseStorage = getStorage(firebaseApp)
      console.log("Firebase Storage initialized successfully")
    } catch (storageError) {
      console.error("Error initializing Firebase Storage:", storageError)
      throw storageError
    }

    // Mark initialization as complete
    isInitialized = true
    isInitializing = false
    console.log("Firebase initialization completed successfully")

    if (initPromiseResolve) {
      initPromiseResolve(true)
    }

    return true
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    isInitializing = false
    initError = error as Error

    if (initPromiseReject) {
      initPromiseReject(error)
    }

    return false
  }
}

// Function to get Firebase services safely
export function getFirebaseServices() {
  // If we're on the server, return null values
  if (typeof window === "undefined") {
    return {
      app: null,
      auth: null,
      db: null,
      storage: null,
      isInitialized: false,
      isInitializing: false,
      error: null,
      initialize: async () => false,
    }
  }

  // Start initialization if not already started
  if (!isInitializing && !isInitialized && !initError) {
    initializeFirebase().catch(console.error)
  }

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
    isInitialized,
    isInitializing,
    error: initError,
    initialize: initializeFirebase,
  }
}

// React hook for Firebase
export function useFirebase() {
  const [state, setState] = useState({
    isInitialized,
    isInitializing,
    error: initError,
  })

  useEffect(() => {
    // If already initialized or initializing, just update state
    if (isInitialized || isInitializing) {
      setState({
        isInitialized,
        isInitializing,
        error: initError,
      })
      return
    }

    // Start initialization
    initializeFirebase()
      .then(() => {
        setState({
          isInitialized: true,
          isInitializing: false,
          error: null,
        })
      })
      .catch((error) => {
        setState({
          isInitialized: false,
          isInitializing: false,
          error,
        })
      })

    // Cleanup function
    return () => {
      // Nothing to clean up
    }
  }, [])

  return {
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
    ...state,
    initialize: initializeFirebase,
  }
}

// Wait for Firebase to initialize
export async function waitForFirebase(timeoutMs = 10000) {
  if (typeof window === "undefined") return false
  if (isInitialized) return true

  // Start initialization if not already started
  if (!isInitializing && !initPromise) {
    initializeFirebase().catch(console.error)
  }

  // Set a timeout
  const timeoutPromise = new Promise<boolean>((resolve) => {
    setTimeout(() => resolve(false), timeoutMs)
  })

  // Race between initialization and timeout
  return Promise.race([initPromise || Promise.resolve(false), timeoutPromise])
}

// For backward compatibility
export const app = firebaseApp
export const auth = firebaseAuth
export const db = firebaseDb
export const storage = firebaseStorage

export default getFirebaseServices
