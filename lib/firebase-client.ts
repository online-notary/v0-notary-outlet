"\"use client"

// Track initialization state
let isInitialized = false
let isInitializing = false
let firebaseApp: any = null
let firebaseAuth: any = null
let firebaseDb: any = null
let firebaseStorage: any = null

// Initialize Firebase only when explicitly called
export async function initializeFirebase() {
  // Don't initialize on the server
  if (typeof window === "undefined") {
    return { success: false, error: "Cannot initialize Firebase on the server" }
  }

  // Prevent multiple initialization attempts
  if (isInitializing) {
    return { success: false, error: "Firebase initialization already in progress" }
  }

  // Return existing instance if already initialized
  if (isInitialized && firebaseApp && firebaseAuth) {
    return {
      success: true,
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    }
  }

  isInitializing = true
  console.log("Starting Firebase initialization...")

  try {
    // First, import and initialize the Firebase app
    const { initializeApp, getApps } = await import("firebase/app")

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

    // Initialize Firebase Auth - IMPORTANT: We need to do this separately and carefully
    console.log("Initializing Firebase Auth...")
    try {
      // Use the standard getAuth method first
      const { getAuth } = await import("firebase/auth")
      firebaseAuth = getAuth(firebaseApp)
      console.log("Firebase Auth initialized successfully with getAuth")
    } catch (authError) {
      console.error("Error initializing Firebase Auth with getAuth:", authError)

      // If that fails, try a more manual approach
      try {
        console.log("Trying alternative Auth initialization...")
        // We won't use initializeAuth as it might not be available in this environment
        const { getAuth } = await import("firebase/auth")

        // Create a new auth instance without persistence options
        firebaseAuth = getAuth()
        console.log("Firebase Auth initialized with alternative method")
      } catch (altAuthError) {
        console.error("Alternative Auth initialization also failed:", altAuthError)
        throw new Error("Failed to initialize Firebase Auth: " + String(altAuthError))
      }
    }

    // Only proceed with other services if Auth is initialized
    if (!firebaseAuth) {
      throw new Error("Firebase Auth initialization failed")
    }

    // Initialize Firestore
    console.log("Initializing Firebase Firestore...")
    try {
      const { getFirestore } = await import("firebase/firestore")
      firebaseDb = getFirestore(firebaseApp)
      console.log("Firebase Firestore initialized successfully")
    } catch (firestoreError) {
      console.error("Error initializing Firebase Firestore:", firestoreError)
      // Continue even if Firestore fails - Auth is our priority
    }

    // Initialize Storage
    console.log("Initializing Firebase Storage...")
    try {
      const { getStorage } = await import("firebase/storage")
      firebaseStorage = getStorage(firebaseApp)
      console.log("Firebase Storage initialized successfully")
    } catch (storageError) {
      console.error("Error initializing Firebase Storage:", storageError)
      // Continue even if Storage fails - Auth is our priority
    }

    // Mark initialization as complete
    isInitialized = true
    isInitializing = false
    console.log("Firebase initialization completed successfully")

    return {
      success: true,
      app: firebaseApp,
      auth: firebaseAuth,
      db: firebaseDb,
      storage: firebaseStorage,
    }
  } catch (error) {
    console.error("Firebase initialization failed:", error)
    isInitializing = false
    return { success: false, error }
  }
}

// Get Firebase services (only if already initialized)
export function getFirebaseServices() {
  if (!isInitialized) {
    return {
      success: false,
      app: null,
      auth: null,
      db: null,
      storage: null,
    }
  }

  return {
    success: true,
    app: firebaseApp,
    auth: firebaseAuth,
    db: firebaseDb,
    storage: firebaseStorage,
  }
}
