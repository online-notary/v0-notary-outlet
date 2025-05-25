"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  User,
  CheckSquare,
  XSquare,
  Trash2,
  Bug,
} from "lucide-react"
import { collection, getDocs, doc, updateDoc, query, limit, Timestamp, writeBatch } from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { initializeApp } from "firebase/app"
import { firebaseConfig } from "@/lib/firebase"

// Notary type
interface Notary {
  id: string
  name: string
  email: string
  state: string
  address?: string
  commissionNumber: string
  commissionExpiration?: string
  isApproved: boolean
  profileImageUrl: string | null
  availability?: string[]
}

export default function NotaryAdminPage() {
  // State
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [filteredNotaries, setFilteredNotaries] = useState<Notary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({})
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  // Bulk action states
  const [selectedNotaries, setSelectedNotaries] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  // Initialize Firebase directly in the component
  useEffect(() => {
    try {
      console.log("Initializing Firebase in admin page")
      initializeApp(firebaseConfig)
      console.log("Firebase initialized successfully")
      checkAdminStatus()
    } catch (err) {
      console.error("Error initializing Firebase:", err)
      setError("Failed to initialize Firebase. Please refresh the page.")
      setAuthLoading(false)
    }
  }, [])

  // Check if the user is an admin
  const checkAdminStatus = async () => {
    try {
      setAuthLoading(true)
      const auth = getAuth()
      const currentUser = auth.currentUser

      // Debug info
      const debugData = {
        authInitialized: !!auth,
        currentUser: currentUser
          ? {
              uid: currentUser.uid,
              email: currentUser.email,
              emailVerified: currentUser.emailVerified,
            }
          : null,
      }

      if (!currentUser) {
        console.log("No user is signed in")
        setDebugInfo({
          ...debugData,
          error: "No user is signed in",
        })
        setError("You must be signed in to access this page")
        setAuthLoading(false)
        return
      }

      setUser(currentUser)
      console.log("Current user:", currentUser.email)

      // For demo purposes, set admin to true
      // In production, you would check the user's role in Firestore
      setIsAdmin(true)
      setDebugInfo({
        ...debugData,
        isAdmin: true,
        message: "Admin status set to true for demo",
      })

      setAuthLoading(false)
      loadNotariesFromFirestore()
    } catch (err) {
      console.error("Error checking admin status:", err)
      setDebugInfo({
        error: "Error checking admin status",
        message: err instanceof Error ? err.message : String(err),
      })
      setError("Failed to check admin status. Please refresh the page.")
      setAuthLoading(false)
    }
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
          notary.state.toLowerCase().includes(query),
      )
      setFilteredNotaries(filtered)
    }
  }, [searchQuery, notaries])

  // Fetch notaries from Firestore
  const fetchNotaries = async () => {
    try {
      console.log("Fetching notaries from Firestore")
      const firestore = getFirestore()

      // For demo purposes, create mock notaries if none exist
      const mockNotaries: Notary[] = [
        {
          id: "mock1",
          name: "John Doe",
          email: "john@example.com",
          state: "California",
          address: "123 Main St",
          commissionNumber: "12345",
          commissionExpiration: "12/31/2023",
          isApproved: true,
          profileImageUrl: null,
        },
        {
          id: "mock2",
          name: "Jane Smith",
          email: "jane@example.com",
          state: "New York",
          address: "456 Park Ave",
          commissionNumber: "67890",
          commissionExpiration: "06/30/2024",
          isApproved: false,
          profileImageUrl: null,
        },
        {
          id: "mock3",
          name: "Bob Johnson",
          email: "bob@example.com",
          state: "Texas",
          address: "789 Oak St",
          commissionNumber: "54321",
          commissionExpiration: "03/15/2024",
          isApproved: true,
          profileImageUrl: null,
        },
      ]

      try {
        // Try to fetch real notaries first
        const snapshot = await getDocs(query(collection(firestore, "notaries"), limit(100)))
        console.log(`Found ${snapshot.size} notaries in Firestore`)

        if (!snapshot.empty) {
          return snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              name: data.name || "Unknown",
              email: data.email || "Not provided",
              state: data.state || "Unknown",
              address: data.address || "Not provided",
              commissionNumber: data.commissionNumber || "Not provided",
              commissionExpiration: formatDate(data.commissionExpiration),
              isApproved: data.isApproved || false,
              profileImageUrl: data.profileImageUrl || null,
              availability: data.availability || [],
            }
          })
        }
      } catch (err) {
        console.error("Error fetching real notaries:", err)
        setDebugInfo((prev) => ({
          ...prev,
          firestoreError: err instanceof Error ? err.message : String(err),
        }))
      }

      // If no real notaries or error, return mock data
      console.log("Using mock notaries")
      return mockNotaries
    } catch (err) {
      console.error("Error in fetchNotaries:", err)
      throw err
    }
  }

  // Load notaries from Firestore
  const loadNotariesFromFirestore = async () => {
    setLoading(true)
    setError(null)
    setSelectedNotaries([])

    try {
      const fetchedNotaries = await fetchNotaries()
      console.log(`Loaded ${fetchedNotaries.length} notaries`)
      setNotaries(fetchedNotaries)
      setFilteredNotaries(fetchedNotaries)

      if (fetchedNotaries.length === 0) {
        setError("No notaries found in the database.")
      }
    } catch (err) {
      console.error("Error loading notaries:", err)
      setError("Failed to load notaries. Using mock data instead.")

      // Use mock data as fallback
      const mockNotaries: Notary[] = [
        {
          id: "mock1",
          name: "John Doe",
          email: "john@example.com",
          state: "California",
          address: "123 Main St",
          commissionNumber: "12345",
          commissionExpiration: "12/31/2023",
          isApproved: true,
          profileImageUrl: null,
        },
        {
          id: "mock2",
          name: "Jane Smith",
          email: "jane@example.com",
          state: "New York",
          address: "456 Park Ave",
          commissionNumber: "67890",
          commissionExpiration: "06/30/2024",
          isApproved: false,
          profileImageUrl: null,
        },
      ]

      setNotaries(mockNotaries)
      setFilteredNotaries(mockNotaries)
    } finally {
      setLoading(false)
    }
  }

  // Format date
  const formatDate = (date: any): string => {
    try {
      if (!date) return "Not provided"
      if (date instanceof Timestamp) return date.toDate().toLocaleDateString()
      if (typeof date === "object" && date.seconds) return new Date(date.seconds * 1000).toLocaleDateString()
      if (date instanceof Date) return date.toLocaleDateString()
      if (typeof date === "string") {
        const parsedDate = new Date(date)
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString()
        }
      }
      return String(date)
    } catch {
      return "Invalid date"
    }
  }

  // Toggle approval for a single notary
  const toggleApproval = async (notaryId: string, currentStatus: boolean) => {
    try {
      setMessage(null)

      // Optimistic update
      const updatedNotaries = notaries.map((n) => (n.id === notaryId ? { ...n, isApproved: !currentStatus } : n))
      setNotaries(updatedNotaries)
      setFilteredNotaries(filteredNotaries.map((n) => (n.id === notaryId ? { ...n, isApproved: !currentStatus } : n)))

      // For mock notaries, just show success message
      if (notaryId.startsWith("mock")) {
        setMessage({
          type: "success",
          text: `Notary ${!currentStatus ? "approved" : "unapproved"} successfully (mock data)`,
        })
        return
      }

      // For real notaries, update in Firestore
      try {
        const firestore = getFirestore()
        const notaryRef = doc(firestore, "notaries", notaryId)
        await updateDoc(notaryRef, {
          isApproved: !currentStatus,
          updatedAt: new Date(),
        })

        setMessage({
          type: "success",
          text: `Notary ${!currentStatus ? "approved" : "unapproved"} successfully`,
        })
      } catch (err) {
        console.error("Error updating approval in Firestore:", err)
        setMessage({
          type: "error",
          text: "Failed to update in database, but UI is updated",
        })
      }
    } catch (err) {
      console.error("Error in toggleApproval:", err)
      setMessage({
        type: "error",
        text: "An unexpected error occurred",
      })
    }
  }

  // Handle image error
  const handleImageError = (notaryId: string) => {
    setImageErrors((prev) => ({ ...prev, [notaryId]: true }))
  }

  // Check if image URL is valid
  const isValidImageUrl = (url: string | null): boolean => {
    if (!url) return false
    return url.startsWith("http") || url.startsWith("/")
  }

  // Toggle selection of a notary
  const toggleSelection = (notaryId: string) => {
    setSelectedNotaries((prev) =>
      prev.includes(notaryId) ? prev.filter((id) => id !== notaryId) : [...prev, notaryId],
    )
  }

  // Select all notaries
  const selectAll = () => {
    if (selectedNotaries.length === filteredNotaries.length) {
      setSelectedNotaries([])
    } else {
      setSelectedNotaries(filteredNotaries.map((notary) => notary.id))
    }
  }

  // Execute bulk approval/unapproval
  const executeBulkAction = async (action: "approve" | "unapprove") => {
    if (selectedNotaries.length === 0) return

    setBulkActionLoading(true)
    setMessage(null)

    try {
      const isApproving = action === "approve"

      // Update local state first (optimistic update)
      const updatedNotaries = notaries.map((notary) =>
        selectedNotaries.includes(notary.id) ? { ...notary, isApproved: isApproving } : notary,
      )

      setNotaries(updatedNotaries)
      setFilteredNotaries(
        filteredNotaries.map((notary) =>
          selectedNotaries.includes(notary.id) ? { ...notary, isApproved: isApproving } : notary,
        ),
      )

      // For real notaries, update in Firestore
      const realNotaryIds = selectedNotaries.filter((id) => !id.startsWith("mock"))

      if (realNotaryIds.length > 0) {
        try {
          const firestore = getFirestore()
          const batch = writeBatch(firestore)

          for (const notaryId of realNotaryIds) {
            const notaryRef = doc(firestore, "notaries", notaryId)
            batch.update(notaryRef, {
              isApproved: isApproving,
              updatedAt: new Date(),
            })
          }

          await batch.commit()
        } catch (err) {
          console.error(`Error during bulk ${action} in Firestore:`, err)
          setMessage({
            type: "error",
            text: `Failed to update some notaries in database, but UI is updated`,
          })
        }
      }

      setMessage({
        type: "success",
        text: `Successfully ${isApproving ? "approved" : "unapproved"} ${selectedNotaries.length} notaries`,
      })

      // Clear selections after successful operation
      setSelectedNotaries([])
    } catch (err) {
      console.error(`Error during bulk ${action}:`, err)
      setMessage({
        type: "error",
        text: `Failed to ${action} notaries. Please try again.`,
      })
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Toggle debug info display
  const toggleDebug = () => {
    setShowDebug(!showDebug)
  }

  // Loading states
  if (authLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="mt-2">Checking authentication...</span>
        <Button variant="outline" size="sm" onClick={toggleDebug} className="mt-4">
          <Bug className="h-4 w-4 mr-1" />
          Debug Info
        </Button>

        {showDebug && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md max-w-lg w-full">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto max-h-60">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  // Access denied
  if (!isAdmin && !authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You don't have permission to access this page. Admin privileges are required.</p>
            <div className="mt-4">
              <Button asChild>
                <Link href="/notary/dashboard">Return to Dashboard</Link>
              </Button>
              <Button variant="outline" size="sm" onClick={toggleDebug} className="ml-2">
                <Bug className="h-4 w-4 mr-1" />
                Debug Info
              </Button>
            </div>

            {showDebug && (
              <div className="mt-4 p-4 bg-gray-100 rounded-md">
                <h3 className="font-semibold mb-2">Debug Information:</h3>
                <pre className="text-xs overflow-auto max-h-60">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Loading notaries
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="mt-2">Loading notaries...</span>
        <Button variant="outline" size="sm" onClick={toggleDebug} className="mt-4">
          <Bug className="h-4 w-4 mr-1" />
          Debug Info
        </Button>

        {showDebug && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md max-w-lg w-full">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="text-xs overflow-auto max-h-60">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    )
  }

  // Main content
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Notary Admin Dashboard</h1>
        <Button variant="outline" size="sm" onClick={toggleDebug}>
          <Bug className="h-4 w-4 mr-1" />
          Debug Info
        </Button>
      </div>

      {showDebug && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Authentication:</h3>
                <p>
                  <strong>User:</strong> {user?.email || "Not signed in"}
                </p>
                <p>
                  <strong>Admin:</strong> {isAdmin ? "Yes" : "No"}
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Data:</h3>
                <p>
                  <strong>Notaries:</strong> {notaries.length}
                </p>
                <p>
                  <strong>Selected:</strong> {selectedNotaries.length}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Raw Debug Data:</h3>
              <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {message && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="h-4 w-4 inline mr-2" />
          ) : (
            <AlertCircle className="h-4 w-4 inline mr-2" />
          )}
          {message.text}
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-700">
          <AlertCircle className="h-4 w-4 inline mr-2" />
          {error}
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Notary Management</CardTitle>
          <Button variant="outline" onClick={loadNotariesFromFirestore} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search notaries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>

            {/* Bulk actions section */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center mr-2">
                <Checkbox
                  id="select-all"
                  checked={selectedNotaries.length > 0 && selectedNotaries.length === filteredNotaries.length}
                  onCheckedChange={selectAll}
                  className="mr-2"
                />
                <label htmlFor="select-all" className="text-sm cursor-pointer">
                  {selectedNotaries.length === 0
                    ? "Select All"
                    : selectedNotaries.length === filteredNotaries.length
                      ? "Deselect All"
                      : `${selectedNotaries.length} Selected`}
                </label>
              </div>

              {selectedNotaries.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeBulkAction("approve")}
                    disabled={bulkActionLoading}
                    className="text-green-600 border-green-200 hover:bg-green-50"
                  >
                    <CheckSquare className="h-4 w-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => executeBulkAction("unapprove")}
                    disabled={bulkActionLoading}
                    className="text-amber-600 border-amber-200 hover:bg-amber-50"
                  >
                    <XSquare className="h-4 w-4 mr-1" />
                    Unapprove
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedNotaries([])}
                    disabled={bulkActionLoading}
                    className="text-gray-600"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotaries.length > 0 ? (
              filteredNotaries.map((notary) => (
                <Card
                  key={notary.id}
                  className={`overflow-hidden ${selectedNotaries.includes(notary.id) ? "ring-2 ring-amber-500" : ""}`}
                >
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <Checkbox
                          checked={selectedNotaries.includes(notary.id)}
                          onCheckedChange={() => toggleSelection(notary.id)}
                          className="mr-1"
                        />
                        <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                          {notary.profileImageUrl &&
                          isValidImageUrl(notary.profileImageUrl) &&
                          !imageErrors[notary.id] ? (
                            <div className="relative h-full w-full">
                              <img
                                src={notary.profileImageUrl || "/placeholder.svg"}
                                alt={notary.name}
                                className="object-cover h-full w-full"
                                onError={() => handleImageError(notary.id)}
                              />
                            </div>
                          ) : (
                            <User className="h-6 w-6 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-medium">{notary.name}</h3>
                          <p className="text-sm text-gray-500">{notary.email}</p>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Location:</span>
                          <span>{notary.address || notary.state || "Not provided"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Commission #:</span>
                          <span>{notary.commissionNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Expires:</span>
                          <span>{notary.commissionExpiration}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-500">Status:</span>
                          <div className="flex items-center">
                            <Switch
                              checked={notary.isApproved}
                              onCheckedChange={() => toggleApproval(notary.id, notary.isApproved)}
                              className="mr-2"
                            />
                            <span className={notary.isApproved ? "text-green-600" : "text-gray-500"}>
                              {notary.isApproved ? "Approved" : "Pending"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="border-t p-3 bg-gray-50 flex justify-end">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/notary/${notary.id}`}>
                          <Eye className="h-4 w-4 mr-1" /> View Profile
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8 text-gray-500">
                {error ? error : "No notaries found matching your search criteria"}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
