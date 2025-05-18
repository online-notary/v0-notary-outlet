"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, CheckCircle, Eye, Loader2, RefreshCw, Search, User } from "lucide-react"
import { getFirebaseServices } from "@/app/lib/firebase"
import { collection, getDocs, doc, updateDoc, query, limit, Timestamp } from "firebase/firestore"
import { getFirestore } from "firebase/firestore"
import { useAuth } from "@/contexts/auth-context"

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
  const { user, userData, isAdmin, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [filteredNotaries, setFilteredNotaries] = useState<Notary[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Debug logging
  useEffect(() => {
    console.log("Admin page mounted")
    console.log("Auth state:", {
      user: user?.email,
      role: userData?.role,
      isAdmin,
      authLoading,
    })
  }, [user, userData, isAdmin, authLoading])

  // Load notaries on mount
  useEffect(() => {
    if (!authLoading) {
      if (isAdmin) {
        console.log("User is admin, loading notaries...")
        loadNotariesFromFirestore()
      } else {
        console.log("User is not admin, access denied")
        setError("You don't have admin privileges to view this page")
        setLoading(false)
      }
    }
  }, [isAdmin, authLoading])

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

  // Update the fetchNotaries function to use the notaries collection
  const fetchNotaries = async () => {
    console.log("Fetching notaries from Firestore...")
    const { db } = getFirebaseServices()

    if (!db) {
      console.error("Firestore not initialized")
      throw new Error("Firestore not initialized")
    }

    try {
      // Query the notaries collection directly
      const notariesRef = collection(db, "notaries")
      const notariesQuery = query(notariesRef, limit(100))
      const snapshot = await getDocs(notariesQuery)

      console.log(`Found ${snapshot.size} notaries in notaries collection`)

      if (snapshot.empty) {
        return []
      }

      return snapshot.docs.map((doc) => {
        const data = doc.data()
        console.log(`Notary ${doc.id}:`, data)
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
    } catch (error) {
      console.error("Error fetching notaries:", error)
      throw error
    }
  }

  // Replace the loadNotariesFromFirestore function with this simpler version
  const loadNotariesFromFirestore = async () => {
    setLoading(true)
    setError(null)

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
      setError("Failed to load notaries from Firebase.")
    } finally {
      setLoading(false)
    }
  }

  // Format date from various possible formats
  const formatDate = (date: any): string => {
    if (!date) return "Not provided"

    try {
      if (date instanceof Timestamp) {
        return date.toDate().toLocaleDateString()
      }

      if (typeof date === "object" && date.seconds) {
        return new Date(date.seconds * 1000).toLocaleDateString()
      }

      if (date instanceof Date) {
        return date.toLocaleDateString()
      }

      // Try to parse string date
      if (typeof date === "string") {
        const parsedDate = new Date(date)
        if (!isNaN(parsedDate.getTime())) {
          return parsedDate.toLocaleDateString()
        }
      }

      return String(date)
    } catch (err) {
      console.error("Error formatting date:", err, date)
      return "Invalid date"
    }
  }

  // Toggle notary approval
  const toggleApproval = async (notaryId: string, currentStatus: boolean) => {
    try {
      setMessage(null)

      // Optimistically update UI
      const updatedNotaries = notaries.map((notary) =>
        notary.id === notaryId ? { ...notary, isApproved: !currentStatus } : notary,
      )
      setNotaries(updatedNotaries)
      setFilteredNotaries(
        filteredNotaries.map((notary) => (notary.id === notaryId ? { ...notary, isApproved: !currentStatus } : notary)),
      )

      // Log the change
      console.log(`Toggling approval for ${notaryId} from ${currentStatus} to ${!currentStatus}`)

      // Try to update in Firestore
      try {
        // Try notaries collection first (since that's where we're fetching from)
        const firestore = getFirestore()
        const notaryRef = doc(firestore, "notaries", notaryId)
        await updateDoc(notaryRef, {
          isApproved: !currentStatus,
          updatedAt: new Date(),
        })
        console.log("Updated approval in notaries collection")
        setMessage({
          type: "success",
          text: `Notary ${!currentStatus ? "approved" : "unapproved"} successfully`,
        })
      } catch (err) {
        console.error("Error updating in notaries collection:", err)

        // Try users collection as fallback
        try {
          const firestore = getFirestore()
          const userRef = doc(firestore, "users", notaryId)
          await updateDoc(userRef, {
            isApproved: !currentStatus,
            updatedAt: new Date(),
          })
          console.log("Updated approval in users collection")
          setMessage({
            type: "success",
            text: `Notary ${!currentStatus ? "approved" : "unapproved"} successfully`,
          })
        } catch (fallbackErr) {
          console.error("Error updating in users collection:", fallbackErr)
          setMessage({
            type: "error",
            text: "Failed to update approval status in database",
          })
        }
      }
    } catch (err) {
      console.error("Error in toggleApproval:", err)
      setMessage({
        type: "error",
        text: "An unexpected error occurred",
      })
    }
  }

  // Refresh notaries
  const handleRefresh = () => {
    loadNotariesFromFirestore()
  }

  // Show auth loading state
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    )
  }

  // Show access denied if not admin
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
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Loading notaries from Firebase...</span>
      </div>
    )
  }

  // Update the component to use a simpler list view
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold mb-6">Notary Admin Dashboard</h1>

      {message && (
        <div
          className={`mb-4 p-3 rounded ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
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
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Refresh
          </Button>
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
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
              <span className="ml-2">Loading notaries...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredNotaries.length > 0 ? (
                filteredNotaries.map((notary) => (
                  <Card key={notary.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-4">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                            {notary.profileImageUrl ? (
                              <Image
                                src={notary.profileImageUrl || "/placeholder.svg"}
                                alt={notary.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full">
                                <User className="h-6 w-6 text-gray-400" />
                              </div>
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
