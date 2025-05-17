"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Search, Loader2, Eye, EyeOff } from "lucide-react"
import { getFirestore, collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore"
import { app } from "@/app/lib/firebase"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"

export default function AdminPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [notaries, setNotaries] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [updatingId, setUpdatingId] = useState(null)
  const [redirectToLogin, setRedirectToLogin] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true)

  // Admin email fallback
  const ADMIN_EMAIL = "amy@mediadrops.net"

  useEffect(() => {
    // If user is logged in, check if they're an admin
    if (user) {
      checkAdminStatus()
    } else {
      setIsLoading(false)
      setIsCheckingAdmin(false)
      setRedirectToLogin(true)
    }
  }, [user])

  useEffect(() => {
    if (redirectToLogin) {
      router.push("/notary/login")
    }
  }, [redirectToLogin, router])

  // Check if the user is an admin by looking for the isAdmin field in their notary record
  // or by checking if their email is amy@mediadrops.net as a fallback
  const checkAdminStatus = async () => {
    setIsCheckingAdmin(true)
    try {
      // First check if the user's email is the hardcoded admin email
      if (user.email && user.email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        setIsAdmin(true)
        fetchNotaries()
        return
      }

      // Then check if the user has isAdmin=true in their notary record
      const db = getFirestore(app)
      const notariesRef = collection(db, "notaries")
      const q = query(notariesRef, where("email", "==", user.email), where("isAdmin", "==", true))
      const querySnapshot = await getDocs(q)

      if (!querySnapshot.empty) {
        setIsAdmin(true)
        fetchNotaries()
      } else {
        setIsAdmin(false)
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error checking admin status:", error)
      setError("Error checking admin status: " + error.message)
      setIsAdmin(false)
      setIsLoading(false)
    } finally {
      setIsCheckingAdmin(false)
    }
  }

  const fetchNotaries = async () => {
    try {
      setIsLoading(true)
      const db = getFirestore(app)
      const notariesRef = collection(db, "notaries")

      // Use a simple query to avoid index requirements
      const querySnapshot = await getDocs(notariesRef)

      const notariesData = []
      querySnapshot.forEach((doc) => {
        notariesData.push({
          id: doc.id,
          ...doc.data(),
          isVerified: doc.data().isVerified === true,
          isActive: doc.data().isActive !== false, // Default to true if not set
        })
      })

      // Sort by name client-side
      notariesData.sort((a, b) => {
        const nameA = a.name || ""
        const nameB = b.name || ""
        return nameA.localeCompare(nameB)
      })

      setNotaries(notariesData)
    } catch (error) {
      console.error("Error fetching notaries:", error)
      setError("Error fetching notaries: " + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleNotaryVerification = async (notaryId, currentStatus) => {
    try {
      setUpdatingId(notaryId)
      const db = getFirestore(app)
      const notaryRef = doc(db, "notaries", notaryId)
      const newStatus = !currentStatus

      await updateDoc(notaryRef, {
        isVerified: newStatus,
        verifiedAt: newStatus ? new Date().toISOString() : null,
        verifiedBy: newStatus ? user?.email || "admin" : null,
      })

      // Update local state
      setNotaries(notaries.map((notary) => (notary.id === notaryId ? { ...notary, isVerified: newStatus } : notary)))

      toast({
        title: newStatus ? "Notary Approved" : "Notary Unapproved",
        description: `The notary has been ${newStatus ? "approved" : "unapproved"} successfully.`,
        variant: newStatus ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error updating notary verification:", error)
      setError("Error updating notary: " + error.message)

      toast({
        title: "Error",
        description: "Failed to update notary status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleNotaryStatus = async (notaryId, currentStatus) => {
    try {
      setUpdatingId(notaryId)
      const db = getFirestore(app)
      const notaryRef = doc(db, "notaries", notaryId)
      const newStatus = !currentStatus

      console.log(`Toggling visibility for notary ${notaryId} from ${currentStatus} to ${newStatus}`)

      await updateDoc(notaryRef, {
        isActive: newStatus,
        lastStatusChange: new Date().toISOString(),
        statusChangedBy: user?.email || "admin",
      })

      // Update local state
      setNotaries(notaries.map((notary) => (notary.id === notaryId ? { ...notary, isActive: newStatus } : notary)))

      toast({
        title: newStatus ? "Notary Visible" : "Notary Hidden",
        description: `The notary is now ${newStatus ? "visible" : "hidden"} in the public directory.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Error toggling notary status:", error)
      setError("Error updating notary status: " + error.message)

      toast({
        title: "Error",
        description: "Failed to update notary visibility. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  // Filter notaries based on search term
  const filteredNotaries = notaries.filter((notary) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      (notary.name && notary.name.toLowerCase().includes(searchLower)) ||
      (notary.email && notary.email.toLowerCase().includes(searchLower)) ||
      (notary.state && notary.state.toLowerCase().includes(searchLower)) ||
      (notary.licenseNumber && notary.licenseNumber.toLowerCase().includes(searchLower))
    )
  })

  // If still loading, show loading spinner
  if (isLoading || isCheckingAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-700 mb-4" />
          <div className="text-lg">{isCheckingAdmin ? "Checking admin status..." : "Loading notaries..."}</div>
        </div>
      </div>
    )
  }

  // If not logged in, redirect to login page
  if (redirectToLogin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-amber-700 mb-4" />
          <div className="text-lg">Redirecting to login...</div>
        </div>
      </div>
    )
  }

  // If logged in but not an admin, show access denied
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>This page is only accessible to administrators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>This page is only accessible to administrators</AlertDescription>
            </Alert>

            <div className="bg-gray-100 p-4 rounded-md text-sm">
              <p>
                <strong>Your email:</strong> {user.email}
              </p>
              <p>
                <strong>Admin status:</strong> Not an admin
              </p>
            </div>

            <Button className="w-full" onClick={() => router.push("/notary-dashboard")}>
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // At this point, the user is authenticated as an admin
  const pendingNotaries = notaries.filter((notary) => !notary.isVerified)
  const verifiedNotaries = notaries.filter((notary) => notary.isVerified)
  const activeNotaries = notaries.filter((notary) => notary.isActive)
  const inactiveNotaries = notaries.filter((notary) => !notary.isActive)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="font-bold text-2xl text-amber-700">Admin Dashboard</div>
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.push("/set-admin")}>
              Set Admin Status
            </Button>
            <Button variant="outline" onClick={() => router.push("/notary-dashboard")}>
              Return to Dashboard
            </Button>
            <div className="flex items-center">
              <div className="mr-3 text-right">
                <div className="font-medium">{user.displayName || user.email}</div>
                <div className="text-sm text-gray-500">Administrator</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-200 overflow-hidden">
                {user.photoURL ? (
                  <img src={user.photoURL || "/placeholder.svg"} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-red-100 text-red-800 font-medium">
                    {(user.displayName || user.email || "A").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-600">Manage notary profiles and platform settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Total Notaries</CardTitle>
              <CardDescription>All registered notaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{notaries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Pending Approvals</CardTitle>
              <CardDescription>Notaries awaiting verification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingNotaries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Active Notaries</CardTitle>
              <CardDescription>Visible notaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeNotaries.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Inactive Notaries</CardTitle>
              <CardDescription>Hidden notaries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{inactiveNotaries.length}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notary Approval Management</CardTitle>
            <CardDescription>Approve or unapprove notaries on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by name, email, state, or license number..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>License</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Visibility</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotaries.length > 0 ? (
                    filteredNotaries.map((notary) => (
                      <TableRow key={notary.id}>
                        <TableCell className="font-medium">{notary.name || "N/A"}</TableCell>
                        <TableCell>{notary.email}</TableCell>
                        <TableCell>{notary.state || "N/A"}</TableCell>
                        <TableCell>{notary.licenseNumber || "N/A"}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Checkbox
                              id={`approved-${notary.id}`}
                              checked={notary.isVerified}
                              onCheckedChange={() => toggleNotaryVerification(notary.id, notary.isVerified)}
                              disabled={updatingId === notary.id}
                              className="mr-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                            />
                            <label
                              htmlFor={`approved-${notary.id}`}
                              className={`text-sm ${notary.isVerified ? "text-green-600 font-medium" : "text-gray-500"}`}
                            >
                              {notary.isVerified ? "Approved" : "Not Approved"}
                            </label>
                            {updatingId === notary.id && (
                              <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {notary.isActive ? (
                            <Badge className="bg-blue-500">Visible</Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600 border-red-600">
                              Hidden
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant={notary.isActive ? "destructive" : "default"}
                              onClick={() => toggleNotaryStatus(notary.id, notary.isActive)}
                              disabled={updatingId === notary.id}
                            >
                              {updatingId === notary.id ? (
                                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
                              ) : notary.isActive ? (
                                <EyeOff className="mr-1 h-4 w-4" />
                              ) : (
                                <Eye className="mr-1 h-4 w-4" />
                              )}
                              {notary.isActive ? "Hide" : "Show"}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        {searchTerm ? "No notaries match your search criteria" : "No notaries found"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Notaries</TabsTrigger>
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="active">Visible</TabsTrigger>
            <TabsTrigger value="inactive">Hidden</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardContent className="p-6">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>State</TableHead>
                        <TableHead>License</TableHead>
                        <TableHead>Approved</TableHead>
                        <TableHead>Visibility</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {notaries.map((notary) => (
                        <TableRow key={notary.id}>
                          <TableCell className="font-medium">{notary.name || "N/A"}</TableCell>
                          <TableCell>{notary.email}</TableCell>
                          <TableCell>{notary.state || "N/A"}</TableCell>
                          <TableCell>{notary.licenseNumber || "N/A"}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Checkbox
                                id={`all-approved-${notary.id}`}
                                checked={notary.isVerified}
                                onCheckedChange={() => toggleNotaryVerification(notary.id, notary.isVerified)}
                                disabled={updatingId === notary.id}
                                className="mr-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                              />
                              <label
                                htmlFor={`all-approved-${notary.id}`}
                                className={`text-sm ${notary.isVerified ? "text-green-600 font-medium" : "text-gray-500"}`}
                              >
                                {notary.isVerified ? "Approved" : "Not Approved"}
                              </label>
                              {updatingId === notary.id && (
                                <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => toggleNotaryStatus(notary.id, notary.isActive)}
                              disabled={updatingId === notary.id}
                              className="h-8 px-2"
                            >
                              {notary.isActive ? (
                                <Badge className="bg-blue-500">Visible</Badge>
                              ) : (
                                <Badge variant="outline" className="text-red-600 border-red-600">
                                  Hidden
                                </Badge>
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending">
            <Card>
              <CardContent className="p-6">
                {pendingNotaries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Approve</TableHead>
                          <TableHead>Visibility</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingNotaries.map((notary) => (
                          <TableRow key={notary.id}>
                            <TableCell className="font-medium">{notary.name || "N/A"}</TableCell>
                            <TableCell>{notary.email}</TableCell>
                            <TableCell>{notary.state || "N/A"}</TableCell>
                            <TableCell>{notary.licenseNumber || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  id={`pending-approved-${notary.id}`}
                                  checked={notary.isVerified}
                                  onCheckedChange={() => toggleNotaryVerification(notary.id, notary.isVerified)}
                                  disabled={updatingId === notary.id}
                                  className="mr-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <label htmlFor={`pending-approved-${notary.id}`} className="text-sm text-gray-500">
                                  Approve
                                </label>
                                {updatingId === notary.id && (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={notary.isActive ? "outline" : "default"}
                                onClick={() => toggleNotaryStatus(notary.id, notary.isActive)}
                                disabled={updatingId === notary.id}
                              >
                                {notary.isActive ? "Hide" : "Show"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No pending notaries found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardContent className="p-6">
                {verifiedNotaries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Unapprove</TableHead>
                          <TableHead>Visibility</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {verifiedNotaries.map((notary) => (
                          <TableRow key={notary.id}>
                            <TableCell className="font-medium">{notary.name || "N/A"}</TableCell>
                            <TableCell>{notary.email}</TableCell>
                            <TableCell>{notary.state || "N/A"}</TableCell>
                            <TableCell>{notary.licenseNumber || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  id={`approved-verified-${notary.id}`}
                                  checked={notary.isVerified}
                                  onCheckedChange={() => toggleNotaryVerification(notary.id, notary.isVerified)}
                                  disabled={updatingId === notary.id}
                                  className="mr-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <label
                                  htmlFor={`approved-verified-${notary.id}`}
                                  className="text-sm text-green-600 font-medium"
                                >
                                  Approved
                                </label>
                                {updatingId === notary.id && (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant={notary.isActive ? "outline" : "default"}
                                onClick={() => toggleNotaryStatus(notary.id, notary.isActive)}
                                disabled={updatingId === notary.id}
                              >
                                {notary.isActive ? "Hide" : "Show"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No approved notaries found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="active">
            <Card>
              <CardContent className="p-6">
                {activeNotaries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Approved</TableHead>
                          <TableHead>Hide</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeNotaries.map((notary) => (
                          <TableRow key={notary.id}>
                            <TableCell className="font-medium">{notary.name || "N/A"}</TableCell>
                            <TableCell>{notary.email}</TableCell>
                            <TableCell>{notary.state || "N/A"}</TableCell>
                            <TableCell>{notary.licenseNumber || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  id={`active-approved-${notary.id}`}
                                  checked={notary.isVerified}
                                  onCheckedChange={() => toggleNotaryVerification(notary.id, notary.isVerified)}
                                  disabled={updatingId === notary.id}
                                  className="mr-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <label
                                  htmlFor={`active-approved-${notary.id}`}
                                  className={`text-sm ${notary.isVerified ? "text-green-600 font-medium" : "text-gray-500"}`}
                                >
                                  {notary.isVerified ? "Approved" : "Not Approved"}
                                </label>
                                {updatingId === notary.id && (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => toggleNotaryStatus(notary.id, notary.isActive)}
                                disabled={updatingId === notary.id}
                              >
                                <EyeOff className="mr-1 h-4 w-4" />
                                Hide
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No visible notaries found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inactive">
            <Card>
              <CardContent className="p-6">
                {inactiveNotaries.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>State</TableHead>
                          <TableHead>License</TableHead>
                          <TableHead>Approved</TableHead>
                          <TableHead>Show</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {inactiveNotaries.map((notary) => (
                          <TableRow key={notary.id}>
                            <TableCell className="font-medium">{notary.name || "N/A"}</TableCell>
                            <TableCell>{notary.email}</TableCell>
                            <TableCell>{notary.state || "N/A"}</TableCell>
                            <TableCell>{notary.licenseNumber || "N/A"}</TableCell>
                            <TableCell>
                              <div className="flex items-center">
                                <Checkbox
                                  id={`inactive-approved-${notary.id}`}
                                  checked={notary.isVerified}
                                  onCheckedChange={() => toggleNotaryVerification(notary.id, notary.isVerified)}
                                  disabled={updatingId === notary.id}
                                  className="mr-2 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                                />
                                <label
                                  htmlFor={`inactive-approved-${notary.id}`}
                                  className={`text-sm ${notary.isVerified ? "text-green-600 font-medium" : "text-gray-500"}`}
                                >
                                  {notary.isVerified ? "Approved" : "Not Approved"}
                                </label>
                                {updatingId === notary.id && (
                                  <Loader2 className="ml-2 h-4 w-4 animate-spin text-gray-500" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                                onClick={() => toggleNotaryStatus(notary.id, notary.isActive)}
                                disabled={updatingId === notary.id}
                              >
                                <Eye className="mr-1 h-4 w-4" />
                                Show
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">No hidden notaries found</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
