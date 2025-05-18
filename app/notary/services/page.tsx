"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientOnly } from "../../components/client-only"
import { AlertCircle, Loader2, LogOut, User, Calendar, FileText, Settings, Home, Shield, Clock } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// List of available notary services
const AVAILABLE_SERVICES = [
  "Loan Documents",
  "Mobile Service",
  "Affidavits",
  "Oaths & Affirmations",
  "Jurats",
  "Depositions",
  "Real Estate",
  "Power of Attorney",
  "Wills & Trusts",
  "Acknowledgments",
  "Copy Certifications",
  "Mortgage Closings",
]

export default function NotaryServicesPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Services state
  const [selectedServices, setSelectedServices] = useState<string[]>([])

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
            await fetchNotaryServices(user.uid)
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

  const fetchNotaryServices = async (userId: string) => {
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

        // Set selected services from Firestore data
        if (data.services && Array.isArray(data.services)) {
          setSelectedServices(data.services)
        } else {
          // Default to all services if none are set
          setSelectedServices(AVAILABLE_SERVICES)
        }
      } else {
        // Default to all services for new notaries
        setSelectedServices(AVAILABLE_SERVICES)
      }
    } catch (err: any) {
      console.error("Error fetching notary services:", err)
      setError("Failed to load your services. Please try again.")
    }
  }

  const handleSaveServices = async () => {
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user?.uid) {
        throw new Error("You must be logged in to save your services")
      }

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
      const { doc, updateDoc, serverTimestamp } = await import("firebase/firestore")

      // Update services in Firestore
      const notaryRef = doc(db, "notaries", user.uid)
      await updateDoc(notaryRef, {
        services: selectedServices,
        updatedAt: serverTimestamp(),
      })

      setSuccess("Services saved successfully!")
    } catch (err: any) {
      console.error("Error saving services:", err)
      setError(err.message || "Failed to save services. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleToggleService = (service: string) => {
    setSelectedServices((prev) => {
      if (prev.includes(service)) {
        return prev.filter((s) => s !== service)
      } else {
        return [...prev, service]
      }
    })
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
        <span className="ml-2">Loading services...</span>
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
              <Button variant="ghost" className="w-full justify-start bg-gray-100" asChild>
                <Link href="/notary/services">
                  <FileText className="h-4 w-4 mr-2" />
                  Services
                </Link>
              </Button>
              <Button variant="ghost" className="w-full justify-start" asChild>
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
            <h1 className="text-2xl font-bold mb-1">Services Offered</h1>
            <p className="text-gray-500 mb-6">Select the notary services you provide</p>

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    {AVAILABLE_SERVICES.slice(0, 6).map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service}`}
                          checked={selectedServices.includes(service)}
                          onCheckedChange={() => handleToggleService(service)}
                        />
                        <Label htmlFor={`service-${service}`}>{service}</Label>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    {AVAILABLE_SERVICES.slice(6).map((service) => (
                      <div key={service} className="flex items-center space-x-2">
                        <Checkbox
                          id={`service-${service}`}
                          checked={selectedServices.includes(service)}
                          onCheckedChange={() => handleToggleService(service)}
                        />
                        <Label htmlFor={`service-${service}`}>{service}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleSaveServices} className="bg-amber-700 hover:bg-amber-800" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Services"
              )}
            </Button>
          </div>
        </main>
      </div>
    </ClientOnly>
  )
}
