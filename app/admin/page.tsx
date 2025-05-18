"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertCircle, CheckCircle, Eye, Loader2, LogOut, Search, Trash2, User } from "lucide-react"
import { auth, firestore } from "@/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { collection, doc, getDocs, updateDoc, deleteDoc, query, orderBy, Timestamp, getDoc } from "firebase/firestore"

// Notary type definition
interface Notary {
  id: string
  name: string
  email: string
  state: string
  commissionNumber: string
  commissionExpiration: string
  isApproved: boolean
  isVerified: boolean
  profileImageUrl: string | null
  createdAt: Date
  phone: string
  services: string[]
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [filteredNotaries, setFilteredNotaries] = useState<Notary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    verified: 0,
  })

  // Check authentication and admin role
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login")
        return
      }

      setUser(currentUser)

      try {
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid))
        const role = userDoc?.data()?.role

        if (role === "admin") {
          setAuthorized(true)
          fetchNotaries()
        } else {
          router.push("/")
        }
      } catch (err) {
        console.error("Error checking admin role:", err)
        router.push("/")
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [router])

  // Fetch notaries from Firestore
  const fetchNotaries = async () => {
    try {
      setError(null)

      // First try to fetch from users collection where role is "notary"
      const usersRef = collection(firestore, "users")
      const q = query(usersRef, orderBy("createdAt", "desc"))
      const snapshot = await getDocs(q)

      let notariesData: Notary[] = []

      if (snapshot.empty) {
        // If no users found, try the notaries collection as fallback
        const notariesRef = collection(firestore, "notaries")
        const notariesQuery = query(notariesRef, orderBy("createdAt", "desc"))
        const notariesSnapshot = await getDocs(notariesQuery)

        if (notariesSnapshot.empty) {
          // Use mock data if no notaries found in either collection
          const mockData = generateMockNotaries(5)
          setNotaries(mockData)
          setFilteredNotaries(mockData)
          updateStats(mockData)
          return
        }

        notariesData = notariesSnapshot.docs.map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            name: data.name || "Unknown",
            email: data.email || "Not provided",
            state: data.state || "Unknown",
            commissionNumber: data.commissionNumber || "Not provided",
            commissionExpiration: data.commissionExpiration || "Not provided",
            isApproved: data.isApproved || false,
            isVerified: data.isVerified || false,
            profileImageUrl: data.profileImageUrl || null,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
            phone: data.phone || "Not provided",
            services: data.services || [],
          } as Notary
        })
      } else {
        // Process users with "notary" role
        notariesData = snapshot.docs
          .filter((doc) => doc.data().role === "notary")
          .map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              name: data.fullName || "Unknown",
              email: data.email || "Not provided",
              state: data.state || "Unknown",
              commissionNumber: data.notaryCommissionNumber || "Not provided",
              commissionExpiration:
                data.commissionExpirationDate instanceof Timestamp
                  ? data.commissionExpirationDate.toDate().toLocaleDateString()
                  : "Not provided",
              isApproved: data.isApproved || false,
              isVerified: data.isVerified || false,
              profileImageUrl: data.profileImageUrl || null,
              createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(),
              phone: data.phone || "Not provided",
              services: data.services || [],
            } as Notary
          })
      }

      setNotaries(notariesData)
      setFilteredNotaries(notariesData)
      updateStats(notariesData)
    } catch (err: any) {
      console.error("Error fetching notaries:", err)
      setError("Failed to load notaries. Please try again.")

      // Use mock data as fallback
      const mockData = generateMockNotaries(5)
      setNotaries(mockData)
      setFilteredNotaries(mockData)
      updateStats(mockData)
    }
  }

  // Update statistics
  const updateStats = (data: Notary[]) => {
    const approved = data.filter((notary) => notary.isApproved).length
    const verified = data.filter((notary) => notary.isVerified).length

    setStats({
      total: data.length,
      approved,
      pending: data.length - approved,
      verified,
    })
  }

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredNotaries(notaries)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = notaries.filter(
        (notary) =>
          notary.name.toLowerCase().includes(query) ||
          notary.email.toLowerCase().includes(query) ||
          notary.state.toLowerCase().includes(query) ||
          notary.commissionNumber.toLowerCase().includes(query),
      )
      setFilteredNotaries(filtered)
    }
  }, [searchQuery, notaries])

  // Toggle notary approval status
  const handleToggleApproval = async (notaryId: string, currentStatus: boolean) => {
    try {
      setError(null)
      setSuccess(null)

      // Try to update in users collection first
      const userRef = doc(firestore, "users", notaryId)
      await updateDoc(userRef, {
        isApproved: !currentStatus,
        updatedAt: new Date(),
      })

      // Update local state
      const updatedNotaries = notaries.map((notary) =>
        notary.id === notaryId ? { ...notary, isApproved: !currentStatus } : notary,
      )

      setNotaries(updatedNotaries)
      setFilteredNotaries(
        filteredNotaries.map((notary) => (notary.id === notaryId ? { ...notary, isApproved: !currentStatus } : notary)),
      )

      updateStats(updatedNotaries)
      setSuccess(`Notary ${!currentStatus ? "approved" : "unapproved"} successfully`)
    } catch (err: any) {
      console.error("Error updating approval status:", err)

      try {
        // Fallback to notaries collection
        const notaryRef = doc(firestore, "notaries", notaryId)
        await updateDoc(notaryRef, {
          isApproved: !currentStatus,
          updatedAt: new Date(),
        })

        // Update local state
        const updatedNotaries = notaries.map((notary) =>
          notary.id === notaryId ? { ...notary, isApproved: !currentStatus } : notary,
        )

        setNotaries(updatedNotaries)
        setFilteredNotaries(
          filteredNotaries.map((notary) =>
            notary.id === notaryId ? { ...notary, isApproved: !currentStatus } : notary,
          ),
        )

        updateStats(updatedNotaries)
        setSuccess(`Notary ${!currentStatus ? "approved" : "unapproved"} successfully`)
      } catch (fallbackErr) {
        console.error("Error updating approval status (fallback):", fallbackErr)
        setError("Failed to update approval status. Please try again.")
      }
    }
  }

  // Delete notary
  const handleDeleteNotary = async (notaryId: string) => {
    if (!confirm("Are you sure you want to delete this notary? This action cannot be undone.")) {
      return
    }

    try {
      setError(null)
      setSuccess(null)

      // Try to delete from users collection first
      try {
        const userRef = doc(firestore, "users", notaryId)
        await deleteDoc(userRef)
      } catch (err) {
        // Fallback to notaries collection
        const notaryRef = doc(firestore, "notaries", notaryId)
        await deleteDoc(notaryRef)
      }

      // Update local state
      const updatedNotaries = notaries.filter((notary) => notary.id !== notaryId)
      setNotaries(updatedNotaries)
      setFilteredNotaries(filteredNotaries.filter((notary) => notary.id !== notaryId))

      updateStats(updatedNotaries)
      setSuccess("Notary deleted successfully")
    } catch (err: any) {
      console.error("Error deleting notary:", err)
      setError("Failed to delete notary. Please try again.")
    }
  }

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push("/login")
    } catch (err: any) {
      console.error("Logout error:", err)
      setError("Failed to log out. Please try again.")
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Checking permissions...</span>
      </div>
    )
  }

  // If not authorized, don't render anything (router will redirect)
  if (!authorized) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="font-bold text-2xl text-amber-700">NotaryOutlet</h1>
            <Badge variant="outline" className="ml-4">
              Admin Dashboard
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:inline-block">{user?.email || "Admin User"}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Dashboard Tabs */}
        <Tabs defaultValue="notaries" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="notaries">Notaries</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Notaries Tab */}
          <TabsContent value="notaries">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl">{stats.total}</CardTitle>
                  <CardDescription>Total Notaries</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-green-600">{stats.approved}</CardTitle>
                  <CardDescription>Approved</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-amber-600">{stats.pending}</CardTitle>
                  <CardDescription>Pending Approval</CardDescription>
                </CardHeader>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-2xl text-blue-600">{stats.verified}</CardTitle>
                  <CardDescription>Verified</CardDescription>
                </CardHeader>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Notary Management</CardTitle>
                <CardDescription>
                  Approve or unapprove notaries to control their visibility in the public directory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search notaries..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <Button onClick={fetchNotaries} variant="outline" className="ml-2">
                    Refresh
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Notary</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>Commission #</TableHead>
                        <TableHead>Expiration</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Approval Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredNotaries.length > 0 ? (
                        filteredNotaries.map((notary) => (
                          <TableRow key={notary.id}>
                            <TableCell>
                              <div className="flex items-center space-x-3">
                                <div className="relative h-10 w-10 rounded-full overflow-hidden bg-gray-100">
                                  {notary.profileImageUrl ? (
                                    <Image
                                      src={notary.profileImageUrl || "/placeholder.svg"}
                                      alt={notary.name}
                                      fill
                                      className="object-cover"
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full">
                                      <User className="h-5 w-5 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium">{notary.name}</div>
                                  <div className="text-xs text-gray-500">{notary.phone}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{notary.email}</TableCell>
                            <TableCell>{notary.state}</TableCell>
                            <TableCell>{notary.commissionNumber}</TableCell>
                            <TableCell>{notary.commissionExpiration}</TableCell>
                            <TableCell>
                              {notary.createdAt.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Switch
                                  checked={notary.isApproved}
                                  onCheckedChange={() => handleToggleApproval(notary.id, notary.isApproved)}
                                />
                                <span className={notary.isApproved ? "text-green-600" : "text-gray-500"}>
                                  {notary.isApproved ? "Approved" : "Unapproved"}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/notary/${notary.id}`}>
                                    <Eye className="h-4 w-4 mr-1" /> View
                                  </Link>
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                  onClick={() => handleDeleteNotary(notary.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                            {searchQuery
                              ? "No notaries found matching your search criteria"
                              : "No notaries found in the system"}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Admin Settings</CardTitle>
                <CardDescription>Configure admin dashboard settings</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <p className="text-gray-500">Admin settings coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

// Helper function to generate mock notaries for testing
function generateMockNotaries(count: number): Notary[] {
  const states = ["California", "Texas", "Florida", "New York", "Illinois"]
  const services = ["Loan Documents", "Real Estate", "Mobile Service", "Power of Attorney", "Wills & Trusts"]

  return Array.from({ length: count }, (_, i) => ({
    id: `mock-${i + 1}`,
    name: `Notary ${i + 1}`,
    email: `notary${i + 1}@example.com`,
    state: states[Math.floor(Math.random() * states.length)],
    commissionNumber: `${100000 + i}`,
    commissionExpiration: new Date(Date.now() + Math.random() * 365 * 24 * 60 * 60 * 1000).toLocaleDateString(),
    isApproved: Math.random() > 0.5,
    isVerified: Math.random() > 0.7,
    profileImageUrl: null,
    createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000),
    phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
    services: Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => services[Math.floor(Math.random() * services.length)],
    ),
  }))
}
