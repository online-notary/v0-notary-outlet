"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/lib/roles"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: UserRole
  requireApproval?: boolean
  redirectTo?: string
  allowAdmin?: boolean // Add this prop
}

export function ProtectedRoute({
  children,
  requiredRole,
  requireApproval = false,
  redirectTo = "/login",
  allowAdmin = true, // Default to true
}: ProtectedRouteProps) {
  const { user, userData, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!user) {
        console.log("User not authenticated, redirecting to", redirectTo)
        router.push(redirectTo)
        return
      }

      // Log the current state for debugging
      console.log("Protected route check:", {
        requiredRole,
        userRole: userData?.role,
        isAdmin,
        requireApproval,
        isApproved: userData?.isApproved,
      })

      // If role is required and user doesn't have it (and isn't admin or admin access is disabled)
      if (requiredRole && userData?.role !== requiredRole && (!isAdmin || !allowAdmin)) {
        console.log("User doesn't have required role, redirecting to", redirectTo)
        router.push(redirectTo)
        return
      }

      // If approval is required and user isn't approved (and isn't admin or admin access is disabled)
      if (requireApproval && !userData?.isApproved && (!isAdmin || !allowAdmin)) {
        console.log("User isn't approved, redirecting to pending approval")
        router.push("/notary/pending-approval")
        return
      }
    }
  }, [user, userData, loading, requiredRole, requireApproval, redirectTo, router, isAdmin, allowAdmin])

  // Show nothing while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        <span className="ml-2 text-amber-700">Loading...</span>
      </div>
    )
  }

  // If not authenticated or doesn't have required role/approval, show nothing
  if (
    !user ||
    (requiredRole && userData?.role !== requiredRole && (!isAdmin || !allowAdmin)) ||
    (requireApproval && !userData?.isApproved && (!isAdmin || !allowAdmin))
  ) {
    return null
  }

  // Otherwise, render children
  return <>{children}</>
}
