"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChanged } from "firebase/auth"
import { getFirebaseAuth } from "@/app/lib/firebase"

type AuthContextType = {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubscribe = () => {}

    const initAuth = async () => {
      try {
        const auth = await getFirebaseAuth()
        if (!auth) {
          console.error("Auth not initialized")
          setLoading(false)
          return
        }

        unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        })
      } catch (error) {
        console.error("Error in AuthProvider:", error)
        setLoading(false)
      }
    }

    initAuth()

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
