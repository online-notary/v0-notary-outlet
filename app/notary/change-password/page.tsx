"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientOnly } from "../../components/client-only"
import { AlertCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react"
import { Label } from "@/components/ui/label"

export default function ChangePasswordPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Form state
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Only import Firebase when the component mounts
        const { getFirebaseAuth } = await import("../../lib/firebase-client")
        const auth = await getFirebaseAuth()

        if (!auth) {
          throw new Error("Authentication is not available")
        }

        // Check if user is logged in
        const unsubscribe = auth.onAuthStateChanged((user: any) => {
          if (user) {
            setUser(user)
          } else {
            // Redirect to login if not logged in
            router.push("/notary/login")
          }
          setLoading(false)
        })

        // Cleanup subscription
        return () => unsubscribe()
      } catch (err: any) {
        console.error("Auth check error:", err)
        setError(err.message || "Failed to check authentication status")
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate passwords
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match")
      return
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long")
      return
    }

    setSubmitting(true)

    try {
      // Initialize Firebase Auth
      const { getFirebaseAuth } = await import("../../lib/firebase-client")
      const auth = await getFirebaseAuth()

      if (!auth || !user) {
        throw new Error("Authentication is not available")
      }

      // Import auth functions
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import("firebase/auth")

      // Reauthenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      // Show success message
      setSuccess("Your password has been updated successfully")

      // Clear form
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")

      // Redirect back to settings after a delay
      setTimeout(() => {
        router.push("/notary/settings")
      }, 3000)
    } catch (err: any) {
      console.error("Password change error:", err)

      // Handle specific Firebase auth errors
      if (err.code === "auth/wrong-password") {
        setError("Current password is incorrect")
      } else if (err.code === "auth/weak-password") {
        setError("New password is too weak. Please choose a stronger password")
      } else {
        setError(err.message || "Failed to change password. Please try again.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Loading...</span>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/notary/settings" className="inline-flex items-center text-amber-700 hover:text-amber-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl">Change Password</CardTitle>
              <CardDescription>Update your account password</CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="bg-green-50 border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <AlertDescription className="text-green-700">{success}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center border-t p-4">
              <p className="text-sm text-gray-500">
                Make sure to use a strong, unique password that you don't use elsewhere.
              </p>
            </CardFooter>
          </Card>
        </main>
      </div>
    </ClientOnly>
  )
}
