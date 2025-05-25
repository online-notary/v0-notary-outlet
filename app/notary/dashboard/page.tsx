"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClientOnly } from "../../components/client-only"
import { Loader2, User, FileText, Settings, Home, Shield, Clock, X, Check, ExternalLink, MapPin } from "lucide-react"
import Header from "../../components/header"
import { PriceBadge } from "../../components/price-badge"
import { initializeFirebase, getFirebaseServices } from "@/lib/firebase-client"
import { onAuthStateChanged } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock customer request data
const mockRequests = [
  {
    id: "req-001",
    customerName: "John Smith",
    email: "john.smith@example.com",
    phone: "(555) 123-4567",
    date: "2025-05-20T14:00:00",
    location: "123 Main St, Anytown, CA",
    status: "pending",
    message: "Need notarization for mortgage refinance documents. About 20 pages total.",
    documentType: "Real Estate",
  },
  {
    id: "req-002",
    customerName: "Sarah Johnson",
    email: "sarah.j@example.com",
    phone: "(555) 987-6543",
    date: "2025-05-21T10:30:00",
    location: "Customer's office - 456 Business Ave",
    status: "confirmed",
    message: "Power of attorney document needs to be notarized urgently.",
    documentType: "Power of Attorney",
  },
  {
    id: "req-003",
    customerName: "Michael Wong",
    email: "mwong@example.com",
    phone: "(555) 456-7890",
    date: "2025-05-22T16:15:00",
    location: "Starbucks at 789 Park Blvd",
    status: "pending",
    message: "Need to notarize an affidavit. It's a single page document.",
    documentType: "Affidavit",
  },
]

export default function NotaryDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [requests, setRequests] = useState(mockRequests)
  const [isRequestsOpen, setIsRequestsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("pending")

  // Filter requests based on status
  const pendingRequests = requests.filter((req) => req.status === "pending")
  const confirmedRequests = requests.filter((req) => req.status === "confirmed")

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

  // Format date to readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return (
      date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      })
    )
  }

  // Handle request status change
  const handleStatusChange = (requestId: string, newStatus: "confirmed" | "rejected" | "pending") => {
    setRequests((prevRequests) =>
      prevRequests.map((req) => (req.id === requestId ? { ...req, status: newStatus } : req)),
    )
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
                  <CardTitle>Customer Requests</CardTitle>
                  <CardDescription>Your notary service requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <p className="text-2xl font-bold">{pendingRequests.length}</p>
                    <Badge variant={pendingRequests.length > 0 ? "default" : "outline"} className="bg-amber-500">
                      {pendingRequests.length} Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {pendingRequests.length > 0
                      ? `You have ${pendingRequests.length} pending request${pendingRequests.length !== 1 ? "s" : ""}`
                      : "No pending requests"}
                  </p>

                  <Dialog open={isRequestsOpen} onOpenChange={setIsRequestsOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full mt-4 bg-amber-700 hover:bg-amber-800">View Requests</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Customer Requests</DialogTitle>
                        <DialogDescription>Manage your notary service requests from customers</DialogDescription>
                      </DialogHeader>

                      <Tabs defaultValue="pending" className="mt-4" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="pending" className="relative">
                            Pending
                            {pendingRequests.length > 0 && (
                              <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {pendingRequests.length}
                              </span>
                            )}
                          </TabsTrigger>
                          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                        </TabsList>

                        <TabsContent value="pending" className="mt-4">
                          {pendingRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No pending requests at this time</div>
                          ) : (
                            <div className="space-y-4">
                              {pendingRequests.map((request) => (
                                <Card key={request.id} className="overflow-hidden">
                                  <CardContent className="p-0">
                                    <div className="p-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                          <Avatar className="h-10 w-10 mt-1">
                                            <AvatarFallback>{request.customerName.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h3 className="font-medium">{request.customerName}</h3>
                                            <p className="text-sm text-gray-500">{request.email}</p>
                                            <p className="text-sm text-gray-500">{request.phone}</p>
                                          </div>
                                        </div>
                                        <Badge className="bg-amber-500">{request.documentType}</Badge>
                                      </div>

                                      <div className="mt-3 space-y-2">
                                        <div className="flex items-start">
                                          <Clock className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                                          <span className="text-sm">{formatDate(request.date)}</span>
                                        </div>
                                        <div className="flex items-start">
                                          <MapPin className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                                          <span className="text-sm">{request.location}</span>
                                        </div>
                                        <div className="mt-2 text-sm bg-gray-50 p-2 rounded">{request.message}</div>
                                      </div>
                                    </div>

                                    <div className="border-t p-3 bg-gray-50 flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                        onClick={() => handleStatusChange(request.id, "rejected")}
                                      >
                                        <X className="h-4 w-4 mr-1" /> Decline
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-green-600 border-green-200 hover:bg-green-50"
                                        onClick={() => handleStatusChange(request.id, "confirmed")}
                                      >
                                        <Check className="h-4 w-4 mr-1" /> Accept
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>

                        <TabsContent value="confirmed" className="mt-4">
                          {confirmedRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No confirmed appointments</div>
                          ) : (
                            <div className="space-y-4">
                              {confirmedRequests.map((request) => (
                                <Card key={request.id} className="overflow-hidden">
                                  <CardContent className="p-0">
                                    <div className="p-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex items-start space-x-3">
                                          <Avatar className="h-10 w-10 mt-1">
                                            <AvatarFallback>{request.customerName.charAt(0)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                            <h3 className="font-medium">{request.customerName}</h3>
                                            <p className="text-sm text-gray-500">{request.email}</p>
                                            <p className="text-sm text-gray-500">{request.phone}</p>
                                          </div>
                                        </div>
                                        <Badge className="bg-green-500">Confirmed</Badge>
                                      </div>

                                      <div className="mt-3 space-y-2">
                                        <div className="flex items-start">
                                          <Clock className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                                          <span className="text-sm">{formatDate(request.date)}</span>
                                        </div>
                                        <div className="flex items-start">
                                          <MapPin className="h-4 w-4 mt-0.5 mr-2 text-gray-500" />
                                          <span className="text-sm">{request.location}</span>
                                        </div>
                                        <div className="mt-2 text-sm bg-gray-50 p-2 rounded">{request.message}</div>
                                      </div>
                                    </div>

                                    <div className="border-t p-3 bg-gray-50 flex justify-end space-x-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                      >
                                        <ExternalLink className="h-4 w-4 mr-1" /> Add to Calendar
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          )}
                        </TabsContent>
                      </Tabs>
                    </DialogContent>
                  </Dialog>
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
