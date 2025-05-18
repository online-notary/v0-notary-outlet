"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClientOnly } from "../../components/client-only"
import { Loader2, User, Calendar, FileText, Settings, Home, Shield } from "lucide-react"
import Header from "../../components/header"
import { PriceBadge } from "../../components/price-badge"
import { initializeFirebase, getFirebaseServices } from "@/lib/firebase-client"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"

export default function NotaryDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[Dashboard] Component mounted")

    const checkAuth = async () => {
      try {
        console.log("[Dashboard] Checking authentication")
        await initializeFirebase()
        const { auth, db } = getFirebaseServices()

        if (!auth) {
          throw new Error("Firebase Auth not initialized properly")
        }

        // Set up auth state listener
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          console.log("[Dashboard] Auth state changed:", currentUser?.email)

          if (currentUser) {
            setUser(currentUser)

            try {
              // Fetch user data from Firestore
              if (db) {
                const userDocRef = doc(db, "users", currentUser.uid)
                const userDocSnap = await getDoc(userDocRef)

                if (userDocSnap.exists()) {
                  const data = userDocSnap.data()
                  console.log("[Dashboard] User data:", data)
                  setUserData(data)
                } else {
                  console.log("[Dashboard] No user document found")
                  // For demo purposes, create mock user data
                  setUserData({
                    fullName: currentUser.displayName || "Notary User",
                    email: currentUser.email,
                    role: "notary",
                  })
                }
              } else {
                console.log("[Dashboard] Firestore not initialized, using mock data")
                setUserData({
                  fullName: currentUser.displayName || "Notary User",
                  email: currentUser.email,
                  role: "notary",
                })
              }
            } catch (firestoreErr) {
              console.error("[Dashboard] Error fetching user data:", firestoreErr)
              // For demo purposes, create mock user data
              setUserData({
                fullName: currentUser.displayName || "Notary User",
                email: currentUser.email,
                role: "notary",
              })
            }
          } else {
            console.log("[Dashboard] No user logged in, using demo mode")
            // For demo purposes, we'll just show a mock user instead of redirecting
            setUser({
              email: "demo.notary@example.com",
              displayName: "Demo Notary",
            })
            setUserData({
              fullName: "Demo Notary",
              email: "demo.notary@example.com",
              role: "notary",
            })
            // In a real app, you would redirect to login:
            // router.push("/login")
          }

          setLoading(false)
        })

        return () => unsubscribe()
      } catch (err: any) {
        console.error("[Dashboard] Auth check error:", err)
        setError(err.message || "Failed to check authentication status")
        setLoading(false)

        // For demo purposes, set a mock user
        setUser({
          email: "demo.notary@example.com",
          displayName: "Demo Notary",
        })
        setUserData({
          fullName: "Demo Notary",
          email: "demo.notary@example.com",
          role: "notary",
        })
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = async () => {
    try {
      setLoading(true)
      const { auth } = getFirebaseServices()
      if (auth) {
        await auth.signOut()
        router.push("/login")
      }
    } catch (err: any) {
      console.error("[Dashboard] Logout error:", err)
      setError(err.message || "Failed to log out")
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <Header />

        {/* Main content */}
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="w-64 bg-white border-r hidden md:block">
            <nav className="p-4">
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/notary/dashboard">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/notary/appointments">
                    <Calendar className="h-4 w-4 mr-2" />
                    Appointments
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/notary/documents">
                    <FileText className="h-4 w-4 mr-2" />
                    Documents
                  </Link>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <Link href="/notary/profile">
                    <User className="h-4 w-4 mr-2" />
                    Profile
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
              </div>
            </nav>
          </aside>

          {/* Main content area */}
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Notary Dashboard</h1>
              <p className="text-gray-600">
                Welcome back, {userData?.fullName || user?.displayName || user?.email || "Notary"}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Upcoming Appointments</CardTitle>
                  <CardDescription>Your scheduled notary sessions</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-500">No upcoming appointments</p>
                  <Button className="w-full mt-4 bg-amber-700 hover:bg-amber-800">View Calendar</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Recent Documents</CardTitle>
                  <CardDescription>Documents you've notarized</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-gray-500">No recent documents</p>
                  <Button className="w-full mt-4 bg-amber-700 hover:bg-amber-800">View Documents</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Profile Completion</CardTitle>
                  <CardDescription>Complete your profile to get more clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div className="bg-amber-700 h-2.5 rounded-full w-1/4"></div>
                  </div>
                  <p className="text-sm text-gray-500">25% complete</p>
                  <Button className="w-full mt-4 bg-amber-700 hover:bg-amber-800">Complete Profile</Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Getting Started</CardTitle>
                <CardDescription>Complete these steps to start receiving notary requests</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-amber-100 text-amber-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      1
                    </div>
                    <div>
                      <h3 className="font-medium">Complete your profile</h3>
                      <p className="text-sm text-gray-500">Add your credentials, services, and availability</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber-100 text-amber-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      2
                    </div>
                    <div>
                      <h3 className="font-medium">Upload your notary commission</h3>
                      <p className="text-sm text-gray-500">Verify your credentials to appear in search results</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="bg-amber-100 text-amber-700 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                      3
                    </div>
                    <div>
                      <h3 className="font-medium">Set your availability</h3>
                      <p className="text-sm text-gray-500">Let clients know when you're available for appointments</p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <div className="flex justify-center w-full">
                  <PriceBadge size="md" className="transform hover:scale-105 transition-transform" />
                </div>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    </ClientOnly>
  )
}
