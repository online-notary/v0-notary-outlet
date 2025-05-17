"use client"

import type React from "react"

import { useEffect, useState, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { auth, db } from "@/app/lib/firebase"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { signOut, onAuthStateChanged } from "firebase/auth"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  User,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Clock,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Camera,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react"

// Import the new function
import { uploadProfileImage } from "@/app/lib/firebase-storage"

// Add this near the top of the file with other imports
import { useAdmin } from "@/app/hooks/use-admin"

// Types
interface NotaryProfile {
  uid: string
  email: string
  name: string
  licenseNumber: string
  state: string
  commissionExpiration: string
  phone: string
  address: string
  bio: string
  services: string[]
  availability?: AvailabilitySlot[]
  profileImageUrl?: string
  isVerified: boolean
  isActive: boolean
  createdAt: number
  updatedAt: number
}

interface AvailabilitySlot {
  day: string
  startTime: string
  endTime: string
  available: boolean
}

const DAYS_OF_WEEK = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]

const NOTARY_SERVICES = [
  "Loan Documents",
  "Real Estate",
  "Mobile Service",
  "Power of Attorney",
  "Affidavits",
  "Wills & Trusts",
  "Oaths & Affirmations",
  "Acknowledgments",
  "Jurats",
  "Copy Certifications",
  "Depositions",
  "Mortgage Closings",
]

const DEFAULT_AVAILABILITY: AvailabilitySlot[] = DAYS_OF_WEEK.map((day) => ({
  day,
  startTime: "09:00",
  endTime: "17:00",
  available: day !== "Sunday",
}))

export default function NotaryDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [notaryProfile, setNotaryProfile] = useState<NotaryProfile | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingAvailability, setSavingAvailability] = useState(false)
  const [error, setError] = useState("")
  const [warning, setWarning] = useState("")
  const [success, setSuccess] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  // Form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    address: "",
    bio: "",
    services: [] as string[],
  })

  const [availability, setAvailability] = useState<AvailabilitySlot[]>(DEFAULT_AVAILABILITY)

  // Inside the component, add:
  const { isAdmin, adminChecked, userEmail, user } = useAdmin()
  const isAdminUser = user && user.email && user.email.toLowerCase() === "amy@mediadrops.net"

  // Memoize the tab change handler to prevent unnecessary re-renders
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value)
  }, [])

  useEffect(() => {
    let isMounted = true

    const checkAuth = async () => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!isMounted) return

        if (user) {
          try {
            // Get notary profile from Firestore
            console.log("Fetching notary profile for user:", user.uid)
            const notaryDoc = await getDoc(doc(db, "notaries", user.uid))

            if (!isMounted) return

            if (notaryDoc.exists()) {
              const profileData = notaryDoc.data() as NotaryProfile
              setNotaryProfile(profileData)

              // Initialize form data
              setProfileForm({
                name: profileData.name || "",
                phone: profileData.phone || "",
                address: profileData.address || "",
                bio: profileData.bio || "",
                services: profileData.services || [],
              })

              // Initialize availability
              if (profileData.availability && profileData.availability.length > 0) {
                setAvailability(profileData.availability)
              }

              // Set image preview if exists
              if (profileData.profileImageUrl) {
                setImagePreview(profileData.profileImageUrl)
              }
            } else {
              // If we have permission but the profile doesn't exist, create a minimal profile
              console.log("No notary profile found, creating minimal profile")

              // Create a minimal profile with the user's information
              const minimalProfile: NotaryProfile = {
                uid: user.uid,
                email: user.email || "",
                name: user.displayName || "Notary User",
                licenseNumber: "",
                state: "",
                commissionExpiration: "",
                phone: "",
                address: "",
                bio: "",
                services: [],
                isVerified: true, // Assume verified for UI purposes
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }

              setNotaryProfile(minimalProfile)

              // Initialize form with available data
              setProfileForm({
                name: user.displayName || "",
                phone: "",
                address: "",
                bio: "",
                services: [],
              })

              setWarning("Your notary profile is incomplete. Please update your information.")
            }
          } catch (error: any) {
            console.error("Error fetching notary profile:", error)

            // If it's a permission error or we're offline
            if (
              error.message?.includes("permission") ||
              error.message?.includes("Missing or insufficient permissions") ||
              error.code === "permission-denied" ||
              error.message?.includes("offline") ||
              error.code === "unavailable" ||
              error.code === "failed-precondition"
            ) {
              console.log("Permission error or offline, creating minimal profile")
              if (isMounted) {
                setWarning(
                  "Unable to access your full profile due to permission issues or offline status. Some features may be limited.",
                )
              }

              // Create a minimal profile with the user's information
              const minimalProfile: NotaryProfile = {
                uid: user.uid,
                email: user.email || "",
                name: user.displayName || "Notary User",
                licenseNumber: "",
                state: "",
                commissionExpiration: "",
                phone: "",
                address: "",
                bio: "",
                services: [],
                isVerified: true, // Assume verified for UI purposes
                isActive: true,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }

              if (isMounted) {
                setNotaryProfile(minimalProfile)

                // Initialize form with available data
                setProfileForm({
                  name: user.displayName || "",
                  phone: "",
                  address: "",
                  bio: "",
                  services: [],
                })
              }
            } else {
              // For other errors, retry a few times
              if (retryCount < maxRetries && isMounted) {
                setRetryCount(retryCount + 1)
                setError("Failed to load your profile. Retrying...")

                // Wait a moment before retrying
                setTimeout(
                  () => {
                    if (isMounted) {
                      checkAuth()
                    }
                  },
                  1000 * (retryCount + 1),
                ) // Exponential backoff
                return
              } else if (isMounted) {
                setError("Failed to load your profile after multiple attempts. Please try again later.")
              }
            }
          } finally {
            if (isMounted) {
              setLoading(false)
            }
          }
        } else {
          // Not logged in
          router.push("/notary/login")
        }
      })

      return () => {
        isMounted = false
        unsubscribe()
      }
    }

    checkAuth()
  }, [router, retryCount, maxRetries])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]

      // Revoke previous object URL to prevent memory leaks
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }

      setImageFile(file)

      // Use a setTimeout to delay creating the object URL
      // This can help avoid ResizeObserver issues
      setTimeout(() => {
        setImagePreview(URL.createObjectURL(file))
      }, 0)
    }
  }

  // Replace the existing handleUploadImage function with this:
  const handleUploadImage = async () => {
    if (!imageFile || !notaryProfile) return

    setUploadingImage(true)
    setError("")
    setSuccess("")
    setWarning("")

    try {
      // Use our new helper function to handle the upload
      const result = await uploadProfileImage(notaryProfile.uid, imageFile)

      if (result.success && result.url) {
        // Update local state with the new image URL
        setNotaryProfile((prev) => {
          if (!prev) return null
          return {
            ...prev,
            profileImageUrl: result.url,
          }
        })

        // Clear the blob URL and file after successful upload
        if (imagePreview && imagePreview.startsWith("blob:")) {
          URL.revokeObjectURL(imagePreview)
        }
        setImagePreview(result.url)
        setImageFile(null)

        setSuccess("Profile image updated successfully!")
      } else {
        // Handle error
        setError(result.error || "Failed to upload image. Please try again.")
      }
    } catch (error: any) {
      console.error("Unexpected error in image upload:", error)
      setError(`An unexpected error occurred: ${error.message || "Unknown error"}`)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleServiceToggle = (service: string) => {
    setProfileForm((prev) => {
      const services = [...prev.services]
      if (services.includes(service)) {
        return { ...prev, services: services.filter((s) => s !== service) }
      } else {
        return { ...prev, services: [...services, service] }
      }
    })
  }

  const handleAvailabilityChange = (index: number, field: keyof AvailabilitySlot, value: any) => {
    setAvailability((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const saveProfile = async () => {
    if (!notaryProfile) return

    setSavingProfile(true)
    setError("")
    setSuccess("")

    try {
      await updateDoc(doc(db, "notaries", notaryProfile.uid), {
        name: profileForm.name,
        phone: profileForm.phone,
        address: profileForm.address,
        bio: profileForm.bio,
        services: profileForm.services,
        updatedAt: Date.now(),
      })

      // Update local state
      setNotaryProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          name: profileForm.name,
          phone: profileForm.phone,
          address: profileForm.address,
          bio: profileForm.bio,
          services: profileForm.services,
        }
      })

      setSuccess("Profile updated successfully!")
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
    } finally {
      setSavingProfile(false)
    }
  }

  const saveAvailability = async () => {
    if (!notaryProfile) return

    setSavingAvailability(true)
    setError("")
    setSuccess("")

    try {
      await updateDoc(doc(db, "notaries", notaryProfile.uid), {
        availability,
        updatedAt: Date.now(),
      })

      // Update local state
      setNotaryProfile((prev) => {
        if (!prev) return null
        return {
          ...prev,
          availability,
        }
      })

      setSuccess("Availability updated successfully!")
    } catch (error) {
      console.error("Error updating availability:", error)
      setError("Failed to update availability. Please try again.")
    } finally {
      setSavingAvailability(false)
    }
  }

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (!notaryProfile) {
    return null // This should not happen due to the redirect in useEffect
  }

  // Mock data for the dashboard
  const stats = {
    pendingAppointments: 3,
    completedAppointments: 42,
    totalEarnings: 210,
    averageRating: 4.9,
  }

  const recentAppointments = [
    { id: 1, client: "John Smith", date: "2023-05-14", time: "10:00 AM", status: "completed", documents: 2 },
    { id: 2, client: "Sarah Johnson", date: "2023-05-15", time: "2:30 PM", status: "completed", documents: 1 },
    { id: 3, client: "Michael Brown", date: "2023-05-16", time: "4:00 PM", status: "upcoming", documents: 3 },
    { id: 4, client: "Emily Davis", date: "2023-05-17", time: "11:15 AM", status: "upcoming", documents: 2 },
    { id: 5, client: "Robert Wilson", date: "2023-05-18", time: "3:45 PM", status: "upcoming", documents: 1 },
  ]

  // Force admin access for amy@mediadrops.net
  const forceAdmin = notaryProfile.email === "amy@mediadrops.net"

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="font-bold text-2xl text-amber-700">
            NotaryOutlet
          </Link>
          <div className="flex items-center space-x-4">
            {/* Admin button - shown if isAdmin OR email is amy@mediadrops.net */}
            {isAdminUser && (
              <Link href="/admin">
                <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold mr-2 flex items-center">
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  ADMIN DASHBOARD
                </Button>
              </Link>
            )}
            <div className="text-right mr-2">
              <div className="font-medium">{notaryProfile.name}</div>
              <div className="text-sm text-gray-500">Notary Public</div>
            </div>
            <Avatar className="h-10 w-10">
              {notaryProfile.profileImageUrl ? (
                <AvatarImage src={notaryProfile.profileImageUrl || "/placeholder.svg"} alt={notaryProfile.name} />
              ) : (
                <AvatarFallback>{notaryProfile.name.charAt(0)}</AvatarFallback>
              )}
            </Avatar>
          </div>
        </div>
      </header>

      {/* Debug information - only shown in development */}
      {process.env.NODE_ENV !== "production" && (
        <div className="bg-gray-100 border-b p-2 text-xs font-mono">
          <div>
            <strong>Debug:</strong> Email: {notaryProfile.email}
          </div>
          <div>Admin Check: {isAdmin ? "Yes" : "No"}</div>
          <div>Force Admin: {forceAdmin ? "Yes" : "No"}</div>
          <div>Admin Checked: {adminChecked ? "Yes" : "No"}</div>
          <div>User Email from Hook: {userEmail || "Not available"}</div>
        </div>
      )}

      {/* Admin notification banner */}
      {isAdminUser && (
        <div className="bg-red-50 border-l-4 border-red-600 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Admin Access Available</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  You have admin privileges. Access the admin dashboard to manage notary approvals and system settings.
                </p>
              </div>
              <div className="mt-4">
                <Link href="/admin">
                  <Button className="bg-red-600 hover:bg-red-700 text-white font-bold">Go to Admin Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {warning && (
          <Alert className="mb-6 bg-amber-50 border-amber-200">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-600">{warning}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">{success}</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-4">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button
                    variant={activeTab === "overview" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("overview")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Overview
                  </Button>
                  <Button
                    variant={activeTab === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  <Button
                    variant={activeTab === "appointments" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("appointments")}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Appointments
                  </Button>
                  <Button
                    variant={activeTab === "availability" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("availability")}
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Availability
                  </Button>
                  <Button
                    variant={activeTab === "services" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("services")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Services
                  </Button>
                  <Button
                    variant={activeTab === "settings" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleTabChange("settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Button>

                  {/* Direct admin access in sidebar */}
                  {(isAdmin || forceAdmin || notaryProfile.email === "amy@mediadrops.net") && (
                    <Button
                      variant="default"
                      className="w-full justify-start bg-red-600 hover:bg-red-700 mt-4"
                      onClick={() => router.push("/admin")}
                    >
                      <ShieldAlert className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}
                </nav>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                      $5
                    </div>
                    <span className="font-medium">Flat Rate Notary</span>
                  </div>

                  <div className="text-sm text-gray-500">
                    <div className="flex items-center mb-1">
                      <span className="font-medium mr-2">Status:</span>
                      {notaryProfile.isVerified ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-600 flex items-center">
                          <Clock className="h-4 w-4 mr-1" /> Pending Verification
                        </span>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">Member since:</span>{" "}
                      {new Date(notaryProfile.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="hidden">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="appointments">Appointments</TabsTrigger>
                <TabsTrigger value="availability">Availability</TabsTrigger>
                <TabsTrigger value="services">Services</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <h1 className="text-2xl font-bold">Dashboard Overview</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Pending Appointments</p>
                          <p className="text-2xl font-bold">{stats.pendingAppointments}</p>
                        </div>
                        <div className="rounded-full bg-amber-100 p-3">
                          <Clock className="h-6 w-6 text-amber-700" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Completed</p>
                          <p className="text-2xl font-bold">{stats.completedAppointments}</p>
                        </div>
                        <div className="rounded-full bg-green-100 p-3">
                          <CheckCircle2 className="h-6 w-6 text-green-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                          <p className="text-2xl font-bold">${stats.totalEarnings}</p>
                        </div>
                        <div className="rounded-full bg-blue-100 p-3">
                          <DollarSign className="h-6 w-6 text-blue-600" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Rating</p>
                          <p className="text-2xl font-bold">{stats.averageRating}/5</p>
                        </div>
                        <div className="rounded-full bg-yellow-100 p-3">
                          <svg className="h-6 w-6 text-yellow-500 fill-current" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Appointments</CardTitle>
                    <CardDescription>Your scheduled notary appointments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentAppointments
                        .filter((appointment) => appointment.status === "upcoming")
                        .map((appointment) => (
                          <div key={appointment.id} className="flex items-center justify-between border-b pb-4">
                            <div>
                              <div className="font-medium">{appointment.client}</div>
                              <div className="text-sm text-gray-500">
                                {appointment.date} at {appointment.time}
                              </div>
                              <div className="text-xs text-gray-400">
                                {appointment.documents} document{appointment.documents !== 1 ? "s" : ""}
                              </div>
                            </div>
                            <Button size="sm" className="bg-amber-700 hover:bg-amber-800">
                              View Details
                            </Button>
                          </div>
                        ))}

                      {recentAppointments.filter((appointment) => appointment.status === "upcoming").length === 0 && (
                        <div className="text-center py-4">
                          <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-500">No upcoming appointments</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Information</CardTitle>
                    <CardDescription>Update your personal and contact information</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="relative">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {imagePreview || notaryProfile.profileImageUrl ? (
                            <img
                              src={imagePreview || notaryProfile.profileImageUrl || "/placeholder.svg"}
                              alt="Profile preview"
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <User className="h-16 w-16 text-gray-400" />
                          )}
                        </div>
                        <label
                          htmlFor="profile-image"
                          className="absolute bottom-0 right-0 bg-amber-700 text-white p-2 rounded-full cursor-pointer"
                        >
                          <Camera className="h-4 w-4" />
                        </label>
                        <input
                          type="file"
                          id="profile-image"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageChange}
                          ref={fileInputRef}
                        />
                      </div>
                      {imageFile && (
                        <Button onClick={handleUploadImage} disabled={uploadingImage} size="sm">
                          {uploadingImage ? "Uploading..." : "Upload Image"}
                        </Button>
                      )}
                      <p className="text-sm text-gray-500">
                        Upload a professional photo to be displayed in the notary directory
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" name="name" value={profileForm.name} onChange={handleProfileChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email (cannot be changed)</Label>
                        <Input id="email" value={notaryProfile.email} disabled />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input id="phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Business Address</Label>
                        <Input id="address" name="address" value={profileForm.address} onChange={handleProfileChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={profileForm.bio}
                        onChange={handleProfileChange}
                        placeholder="Tell clients about your experience and expertise as a notary..."
                      />
                    </div>

                    <Button onClick={saveProfile} disabled={savingProfile} className="bg-amber-700 hover:bg-amber-800">
                      {savingProfile ? "Saving..." : "Save Profile"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Appointments Tab */}
              <TabsContent value="appointments">
                <h1 className="text-2xl font-bold mb-6">Appointments</h1>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-gray-500">
                      This tab would contain a full calendar and appointment management system.
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Availability Tab */}
              <TabsContent value="availability" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Availability</CardTitle>
                    <CardDescription>Set your working hours for each day of the week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {availability.map((slot, index) => (
                        <div key={index} className="flex items-center space-x-4 py-2 border-b">
                          <div className="w-24 font-medium">{slot.day}</div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id={`available-${index}`}
                              checked={slot.available}
                              onCheckedChange={(checked) => handleAvailabilityChange(index, "available", !!checked)}
                            />
                            <label htmlFor={`available-${index}`}>Available</label>
                          </div>
                          <div className="flex-1 grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <Label htmlFor={`start-${index}`} className="text-xs">
                                Start Time
                              </Label>
                              <Input
                                id={`start-${index}`}
                                type="time"
                                value={slot.startTime}
                                onChange={(e) => handleAvailabilityChange(index, "startTime", e.target.value)}
                                disabled={!slot.available}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label htmlFor={`end-${index}`} className="text-xs">
                                End Time
                              </Label>
                              <Input
                                id={`end-${index}`}
                                type="time"
                                value={slot.endTime}
                                onChange={(e) => handleAvailabilityChange(index, "endTime", e.target.value)}
                                disabled={!slot.available}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={saveAvailability}
                      disabled={savingAvailability}
                      className="mt-6 bg-amber-700 hover:bg-amber-800"
                    >
                      {savingAvailability ? "Saving..." : "Save Availability"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Services Tab */}
              <TabsContent value="services" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Services Offered</CardTitle>
                    <CardDescription>Select the notary services you provide</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {NOTARY_SERVICES.map((service) => (
                        <div key={service} className="flex items-center space-x-2">
                          <Checkbox
                            id={`service-${service}`}
                            checked={profileForm.services.includes(service)}
                            onCheckedChange={() => handleServiceToggle(service)}
                          />
                          <label htmlFor={`service-${service}`} className="text-sm font-medium leading-none">
                            {service}
                          </label>
                        </div>
                      ))}
                    </div>

                    <Button
                      onClick={saveProfile}
                      disabled={savingProfile}
                      className="mt-6 bg-amber-700 hover:bg-amber-800"
                    >
                      {savingProfile ? "Saving..." : "Save Services"}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Account Settings</CardTitle>
                    <CardDescription>Manage your account preferences</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="font-medium">Notary License Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs">License Number</Label>
                            <Input value={notaryProfile.licenseNumber || "Not available"} disabled />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">State</Label>
                            <Input value={notaryProfile.state || "Not available"} disabled />
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Commission Expiration</Label>
                            <Input value={notaryProfile.commissionExpiration || "Not available"} disabled />
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          To update your license information, please contact support.
                        </p>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-medium mb-2">Password</h3>
                        <Button variant="outline">Change Password</Button>
                      </div>

                      <div className="pt-4 border-t">
                        <h3 className="font-medium mb-2 text-red-600">Danger Zone</h3>
                        <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                          Deactivate Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </div>
    </div>
  )
}
