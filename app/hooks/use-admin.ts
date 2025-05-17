"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore"
import { app } from "@/app/lib/firebase"

export function useAdmin() {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Admin email fallback
  const ADMIN_EMAIL = "amy@mediadrops.net"

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true)
      setError(null)

      try {
        if (!user) {
          setIsAdmin(false)
          return
        }

        // First check if the user's email is the hardcoded admin email
        if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
          setIsAdmin(true)
          return
        }

        // Then check if the user has isAdmin=true in their notary record
        const db = getFirestore(app)
        const notariesRef = collection(db, "notaries")
        const q = query(notariesRef, where("email", "==", user.email), where("isAdmin", "==", true))
        const querySnapshot = await getDocs(q)

        setIsAdmin(!querySnapshot.empty)
      } catch (err) {
        console.error("Error checking admin status:", err)
        setError(err.message)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAdminStatus()
  }, [user])

  return { isAdmin, isLoading, error }
}
