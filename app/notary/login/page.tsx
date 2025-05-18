"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientOnly } from "../../components/client-only"
import { AlertCircle, ArrowLeft, Loader2 } from "lucide-react"

// Static login page with no Firebase dependencies
export default function NotaryLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // Only load Firebase when the user actually tries to log in
      const firebaseResult = await initializeFirebaseOnDemand()

      if (!firebaseResult.success) {
        throw new Error(firebaseResult.error ? String(firebaseResult.error) : "Failed to initialize Firebase")
      }

      const auth = firebaseResult.auth
      if (!auth) {
        throw new Error("Firebase auth is not available")
      }

      // Import auth methods dynamically
      const { signInWithEmailAndPassword } = await import("firebase/auth")

      await signInWithEmailAndPassword(auth, email, password)
      router.push("/notary/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)

      // Handle different Firebase auth errors
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password")
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed login attempts. Please try again later.")
      } else {
        setError(err.message || "Failed to login. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Initialize Firebase only when needed (not during component mount)
  const initializeFirebaseOnDemand = async () => {
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

      // Initialize Firebase app
      let firebaseApp
      if (getApps().length === 0) {
        firebaseApp = initializeApp(firebaseConfig)
      } else {
        firebaseApp = getApps()[0]
      }

      // Initialize Firebase Auth
      const { getAuth } = await import("firebase/auth")
      const auth = getAuth(firebaseApp)

      return { success: true, auth }
    } catch (error) {
      console.error("Firebase initialization failed:", error)
      return { success: false, error }
    }
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Notary Login</CardTitle>
              <CardDescription className="text-center">
                Sign in to your notary account to manage your profile and appointments
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/notary/forgot-password" className="text-sm text-amber-700 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/notary/register" className="text-amber-700 hover:underline">
                  Register as a notary
                </Link>
              </div>
            </CardFooter>
          </Card>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-6">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NotaryOutlet. All rights reserved.
          </div>
        </footer>
      </div>
    </ClientOnly>
  )
}
