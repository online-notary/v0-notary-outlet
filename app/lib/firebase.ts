// A simpler approach to Firebase initialization
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"

// Define a variable to hold the Firebase app instance
let firebaseApp: FirebaseApp | undefined

// Initialize Firebase only on the client side
if (typeof window !== "undefined") {
  try {
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

    // Initialize Firebase only if it hasn't been initialized already
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig)
      console.log("Firebase initialized successfully")
    } else {
      firebaseApp = getApps()[0]
      console.log("Firebase already initialized")
    }
  } catch (error) {
    console.error("Error initializing Firebase:", error)
  }
}

// Export the Firebase app instance
export default firebaseApp

// Helper functions to get Firebase services
export async function getFirebaseAuth() {
  if (typeof window === "undefined") return null
  if (!firebaseApp) return null

  try {
    const { getAuth } = await import("firebase/auth")
    return getAuth(firebaseApp)
  } catch (error) {
    console.error("Error getting Firebase Auth:", error)
    return null
  }
}

export async function getFirestore() {
  if (typeof window === "undefined") return null
  if (!firebaseApp) return null

  try {
    const { getFirestore } = await import("firebase/firestore")
    return getFirestore(firebaseApp)
  } catch (error) {
    console.error("Error getting Firestore:", error)
    return null
  }
}

export async function getStorage() {
  if (typeof window === "undefined") return null
  if (!firebaseApp) return null

  try {
    const { getStorage } = await import("firebase/storage")
    return getStorage(firebaseApp)
  } catch (error) {
    console.error("Error getting Firebase Storage:", error)
    return null
  }
}

export const app = firebaseApp

import { getAuth } from "firebase/auth"
export const auth = typeof window !== "undefined" && app ? getAuth(app) : null

import { getFirestore as getFirestoreService } from "firebase/firestore"
export const db = typeof window !== "undefined" && app ? getFirestoreService(app) : null

import { getStorage as getStorageService } from "firebase/storage"
export const storage = typeof window !== "undefined" && app ? getStorageService(app) : null
