"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientOnly } from "../../components/client-only"
import { AlertCircle, Loader2, LogOut, User, Calendar, FileText, Settings, Home, Shield, Clock } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

// List of US states
const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
]

export default function NotarySettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [confirmDeactivate, setConfirmDeactivate] = useState(false)

  // Settings form state
  const [settings, setSettings] = useState({
    licenseNumber: "",
    state: "",
    commissionExpiration: "",
    memberSince: "",
    isVerified: false,
  })

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
        const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
          if (user) {
            setUser(user)
            await fetchNotarySettings(user.uid)
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

  const fetchNotarySettings = async (userId: string) => {
    try {
      // Initialize Firebase
      const { initializeFirebase } = await import("../../lib/firebase-client")
      const firebaseResult = await initializeFirebase()

      if (!firebaseResult.success) {
        throw new Error("Failed to initialize Firebase")
      }

      const { db } = firebaseResult

      if (!db) {
        throw new Error("Firestore is not available")
      }

      // Import Firestore functions
      const { doc, getDoc } = await import("firebase/firestore")

      // Get notary profile from Firestore
      const notaryRef = doc(db, "notaries", userId)
      const notarySnap = await getDoc(notaryRef)

      if (notarySnap.exists()) {
        const data = notarySnap.data()

        // Format date for display
        const createdAt = data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date()
        const memberSince = `${createdAt.getMonth() + 1}/${createdAt.getDate()}/${createdAt.getFullYear()}`

        // Update settings state with data from Firestore
        setSettings({
          licenseNumber: data.commissionNumber || "",
          state: data.state || "",
          commissionExpiration: data.commissionExpiration || "",
          memberSince: memberSince,
          isVerified: data.isVerified || false,
        })
      }
    } catch (err: any) {
      console.error("Error fetching notary settings:", err)
      setError("Failed to load your settings. Please try again.")
    }
  }

  const handleChangePassword = () => {
    router.push("/notary/change-password")
  }

  const handleDeactivateAccount = async () => {
    if (!confirmDeactivate) {
      setConfirmDeactivate(true)
      return
    }

    try {
      // Initialize Firebase
      const { initializeFirebase } = await import("../../lib/firebase-client")
      const firebaseResult = await initializeFirebase()

      if (!firebaseResult.success || !user?.uid) {
        throw new Error("Failed to initialize Firebase")
      }

      const { db } = firebaseResult

      if (!db) {
        throw new Error("Firestore is not available")
      }

      // Import Firestore functions
      const { doc, updateDoc } = await import("firebase/firestore")

      // Update the isActive field to false
      const notaryRef = doc(db, "notaries", user.uid)
      await updateDoc(notaryRef, {
        isActive: false,
      })

      setSuccess("Your account has been deactivated. You will be logged out shortly.")

      // Log the user out after a short delay
      setTimeout(async () => {
        const { getFirebaseAuth } = await import("../../lib/firebase-client")
        const auth = await getFirebaseAuth()
        if (auth) {
          await auth.signOut()
          router.push("/")
        }
      }, 3000)
    } catch (err: any) {
      console.error("Error deactivating account:", err)
      setError(err.message || "Failed to deactivate account. Please try again.")
      setConfirmDeactivate(false)
    }
  }

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { getFirebaseAuth } = await import("../../lib/firebase-client")
      const auth = await getFirebaseAuth()

      if (auth) {
        await auth.signOut()
        router.push("/notary/login")
      }
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(err.message || "Failed to log out")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Loading settings...</span>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r h-screen sticky top-0">
          <div className="p-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-2 text-sm font-bold">
                $5
              </div>
              <span className="font-semibold">Flat Rate Notary</span>
            </div>

            <div className="mb-2 text-sm">
              <div className="flex items-center text-green-600 mb-1">
                <span className="mr-2">Status:</span>
                <div className="flex items-center">
                  {settings.isVerified ? (
                    <>
                      <div className="w-4 h-4 rounded-full bg-green-600 flex items-center justify-center mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                          <path
                            fillRule="evenodd"
                            d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span>Verified</span>
                    </>
                  ) : (
                    <>
                      <div className="w-4 h-4 rounded-full bg-yellow-500 flex items-center justify-center mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-3 h-3">
                          <path
                            fillRule="evenodd"
                            d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-yellow-700">Pending</span>
                    </>
                  )}
                </div>
              </div>
              <div className="text-gray-500">Member since: {settings.memberSince || "N/A"}</div>
            </div>

            <Separator className="my-4" />

            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/notary/dashboard">
                  <Home className="h-4 w-4 mr-2" />
                  Overview
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/notary/profile">
                  <User className="h-4 w-4 mr-2" />
                  Profile
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/notary/appointments">
                  <Calendar className="h-4 w-4 mr-2" />
                  Appointments
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/notary/availability">
                  <Clock className="h-4 w-4 mr-2" />
                  Availability
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/notary/services">
                  <FileText className="h-4 w-4 mr-2" />
                  Services
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start bg-gray-100" asChild>
                <Link href="/notary/settings">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
                <Link href="/notary/admin">
                  <Shield className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Link>
              </Button>
            </nav>

            <Separator className="my-4" />

            <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-1">Account Settings</h1>
            <p className="text-gray-500 mb-6">Manage your account preferences</p>

            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mb-6 bg-green-50 border-green-200">
                <AlertCircle className="h-4 w-4 text-green-500" />
                <AlertDescription className="text-green-700">{success}</AlertDescription>
              </Alert>
            )}

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Notary License Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <label htmlFor="license-number" className="block text-sm font-medium text-gray-700 mb-1">
                      License Number
                    </label>
                    <Input id="license-number" value={settings.licenseNumber} disabled className="bg-gray-50" />
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      State
                    </label>
                    <Select disabled value={settings.state}>
                      <SelectTrigger id="state" className="bg-gray-50">
                        <SelectValue placeholder="Select a state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="commission-expiration" className="block text-sm font-medium text-gray-700 mb-1">
                    Commission Expiration
                  </label>
                  <Input
                    id="commission-expiration"
                    type="date"
                    value={settings.commissionExpiration}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <p className="text-sm text-gray-500 italic">
                  To update your license information, please contact support.
                </p>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Password</h2>

                <Button onClick={handleChangePassword}>Change Password</Button>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>

                {!confirmDeactivate ? (
                  <Button variant="destructive" onClick={handleDeactivateAccount}>
                    Deactivate Account
                  </Button>
                ) : (
                  <div>
                    <p className="text-gray-700 mb-4">
                      Are you sure you want to deactivate your account? Your profile will be hidden from clients and you
                      won't receive new appointments.
                    </p>
                    <div className="flex space-x-4">
                      <Button variant="destructive" onClick={handleDeactivateAccount}>
                        Yes, Deactivate
                      </Button>
                      <Button variant="outline" onClick={() => setConfirmDeactivate(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ClientOnly>
  )
}
