import { initializeApp, getApps, cert } from "firebase-admin/app"

const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_CREDENTIALS || "{}")

export const initializeFirebaseAdmin = () => {
  if (!getApps().length) {
    try {
      initializeApp({
        credential: cert(serviceAccount),
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      })
      console.log("Firebase Admin initialized")
    } catch (error: any) {
      console.error("Firebase Admin initialization error", error.stack)
    }
  }
  return getApps()[0]
}

export const initAdmin = initializeFirebaseAdmin
