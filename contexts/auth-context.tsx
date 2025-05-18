"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type User, onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, firestore } from "@/lib/firebase"
import { ROLES, type UserRole } from "@/lib/roles"

// Define the user data type
export interface UserData {
  uid: string
  email: string | null
  fullName?: string
  role: UserRole
  isApproved: boolean
  notaryCommissionNumber?: string
  state?: string
  commissionExpirationDate?: Date
  eoInsuranceCompany?: string
  eoPolicyNumber?: string
  eoAmount?: string
  eoExpirationDate?: Date
  createdAt?: Date
  updatedAt?: Date
  profileImageUrl?: string
}

// Define the auth context type
interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  error: Error | null
  isAdmin: boolean
  isNotary: boolean
  isApprovedNotary: boolean
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
  isAdmin: false,
  isNotary: false,
  isApprovedNotary: false,
})

// Create the auth provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        setUser(user)

        if (user) {
          try {
            // Fetch user data from Firestore
            const userDoc = await getDoc(doc(firestore, "users", user.uid))

            if (userDoc.exists()) {
              const data = userDoc.data()
              console.log("User data from Firestore:", data) // Add this log
              setUserData({
                uid: user.uid,
                email: user.email,
                fullName: data.fullName,
                role: data.role || ROLES.GUEST,
                isApproved: data.isApproved || false,
                notaryCommissionNumber: data.notaryCommissionNumber,
                state: data.state,
                commissionExpirationDate: data.commissionExpirationDate?.toDate(),
                eoInsuranceCompany: data.eoInsuranceCompany,
                eoPolicyNumber: data.eoPolicyNumber,
                eoAmount: data.eoAmount,
                eoExpirationDate: data.eoExpirationDate?.toDate(),
                createdAt: data.createdAt?.toDate(),
                updatedAt: data.updatedAt?.toDate(),
                profileImageUrl: data.profileImageUrl,
              })
            } else {
              // User exists in Auth but not in Firestore
              setUserData({
                uid: user.uid,
                email: user.email,
                role: ROLES.GUEST,
                isApproved: false,
              })
            }
          } catch (err) {
            console.error("Error fetching user data:", err)
            setError(err instanceof Error ? err : new Error("Failed to fetch user data"))
          }
        } else {
          // User is signed out
          setUserData(null)
        }

        setLoading(false)
      },
      (err) => {
        console.error("Auth state change error:", err)
        setError(err)
        setLoading(false)
      },
    )

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  // Compute role-based flags
  const isAdmin = userData?.role === ROLES.ADMIN
  const isNotary = userData?.role === ROLES.NOTARY
  const isApprovedNotary = isNotary && userData?.isApproved === true

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        error,
        isAdmin,
        isNotary,
        isApprovedNotary,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Create a hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
