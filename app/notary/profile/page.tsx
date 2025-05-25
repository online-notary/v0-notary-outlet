"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ClientOnly } from "../../components/client-only"
import {
  AlertCircle,
  Loader2,
  Save,
  User,
  Upload,
  CheckCircle,
  Trash2,
  Settings,
  CreditCard,
  Users,
  Key,
  BarChart3,
  Sliders,
  RefreshCw,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"

// List of available services
const AVAILABLE_SERVICES = [
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
]

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

export default function NotaryProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [activeTab, setActiveTab] = useState("profile")
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Profile form state
  const [profile, setProfile] = useState({
    name: "",
    title: "Certified Notary Public",
    email: "",
    phone: "",
    city: "",
    state: "",
    bio: "",
    services: [] as string[],
    isActive: true,
    commissionNumber: "",
    commissionExpiration: "",
    acceptsMobileRequests: true,
    hourlyRate: "25",
    availability: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false,
    },
  })

  const addDebugInfo = (message: string) => {
    console.log(`[Profile Debug] ${message}`)
    setDebugInfo((prev) => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addDebugInfo("Component mounted, starting authentication check")
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      addDebugInfo("Importing Firebase client...")
      const { getFirebaseAuth } = await import("../../lib/firebase-client")
      const auth = await getFirebaseAuth()

      if (!auth) {
        addDebugInfo("❌ Authentication is not available")
        setError("Authentication is not available")
        setLoading(false)
        return
      }

      addDebugInfo("✅ Firebase Auth initialized, checking auth state...")

      // Check if user is logged in
      const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
        if (user) {
          addDebugInfo(`✅ User authenticated: ${user.email} (UID: ${user.uid})`)
          setUser(user)
          await fetchNotaryProfile(user.uid)
        } else {
          addDebugInfo("❌ User not authenticated, redirecting to login")
          router.push("/notary/login")
        }
        setLoading(false)
      })

      // Cleanup subscription
      return () => unsubscribe()
    } catch (err: any) {
      addDebugInfo(`❌ Auth check error: ${err.message}`)
      setError(`Authentication error: ${err.message}`)
      setLoading(false)
    }
  }

  const fetchNotaryProfile = async (userId: string) => {
    try {
      addDebugInfo(`Starting profile fetch for user: ${userId}`)

      // Initialize Firebase
      const { initializeFirebase } = await import("../../lib/firebase-client")
      const firebaseResult = await initializeFirebase()

      if (!firebaseResult.success) {
        addDebugInfo("❌ Firebase initialization failed")
        setError("Failed to initialize Firebase")
        return
      }

      addDebugInfo("✅ Firebase initialized successfully")

      const { db } = firebaseResult

      if (!db) {
        addDebugInfo("❌ Firestore is not available")
        setError("Firestore is not available")
        return
      }

      addDebugInfo("✅ Firestore database available")

      // Import Firestore functions
      const { doc, getDoc } = await import("firebase/firestore")

      addDebugInfo(`Attempting to fetch document: notaries/${userId}`)

      // Get notary profile from Firestore
      const notaryRef = doc(db, "notaries", userId)
      const notarySnap = await getDoc(notaryRef)

      if (notarySnap.exists()) {
        const data = notarySnap.data()
        addDebugInfo(`✅ Profile found! Data keys: ${Object.keys(data).join(", ")}`)

        // Update profile state with data from Firestore
        setProfile({
          name: data.name || "",
          title: data.title || "Certified Notary Public",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          city: data.city || "",
          state: data.state || "",
          bio: data.bio || "",
          services: data.services || [],
          isActive: data.isActive !== false,
          commissionNumber: data.commissionNumber || "",
          commissionExpiration: data.commissionExpiration || "",
          acceptsMobileRequests: data.acceptsMobileRequests !== false,
          hourlyRate: data.hourlyRate?.toString() || "25",
          availability: data.availability || {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
          },
        })

        if (data.profileImageUrl) {
          setProfileImageUrl(data.profileImageUrl)
          addDebugInfo("✅ Profile image URL loaded")
        }

        addDebugInfo("✅ Profile data loaded successfully")
      } else {
        addDebugInfo("⚠️ No profile document found, creating new profile")
        // If no profile exists yet, pre-fill with user email
        setProfile((prev) => ({
          ...prev,
          email: user?.email || "",
        }))
      }
    } catch (err: any) {
      addDebugInfo(`❌ Error fetching profile: ${err.message}`)

      // Check if it's a permission error
      if (err.message && err.message.includes("Missing or insufficient permissions")) {
        setError("Permission denied. Please check your Firestore security rules.")
        addDebugInfo("❌ Permission denied - check Firestore rules")
      } else {
        setError(`Failed to load profile: ${err.message}`)
      }

      // Set default profile data even when there's an error
      setProfile((prev) => ({
        ...prev,
        email: user?.email || "",
      }))
    }
  }

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user?.uid) {
        throw new Error("You must be logged in to save your profile")
      }

      addDebugInfo(`Saving profile for user: ${user.uid}`)

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
      const { doc, setDoc, serverTimestamp } = await import("firebase/firestore")

      // Prepare profile data
      const profileData = {
        ...profile,
        location: `${profile.city}, ${profile.state}`,
        updatedAt: serverTimestamp(),
        profileImageUrl: profileImageUrl || null,
        createdAt: serverTimestamp(),
        userId: user.uid,
        isVerified: false,
      }

      addDebugInfo("Attempting to save profile to Firestore...")

      // Save to Firestore
      await setDoc(doc(db, "notaries", user.uid), profileData, { merge: true })

      addDebugInfo("✅ Profile saved successfully")
      setSuccess("Profile saved successfully!")
    } catch (err: any) {
      addDebugInfo(`❌ Error saving profile: ${err.message}`)
      setError(err.message || "Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if (!validTypes.includes(file.type)) {
      setError("Please upload a valid image file (JPEG, PNG, GIF, or WEBP)")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image file is too large. Maximum size is 5MB.")
      return
    }

    setUploadingImage(true)
    setError(null)
    setSuccess(null)

    try {
      addDebugInfo("Starting image upload...")

      // Initialize Firebase
      const { initializeFirebase } = await import("../../lib/firebase-client")
      const firebaseResult = await initializeFirebase()

      if (!firebaseResult.success || !firebaseResult.storage) {
        throw new Error("Failed to initialize Firebase Storage")
      }

      // Import Storage functions
      const { ref, uploadBytes, getDownloadURL } = await import("firebase/storage")

      // Create a reference to the file in Firebase Storage
      const storageRef = ref(firebaseResult.storage, `profile-images/${user?.uid}/${Date.now()}-${file.name}`)

      // Upload the file
      await uploadBytes(storageRef, file)

      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef)

      // Update profile image URL
      setProfileImageUrl(downloadURL)
      addDebugInfo("✅ Image uploaded successfully")
      setSuccess("Profile image uploaded successfully!")
    } catch (err: any) {
      addDebugInfo(`❌ Error uploading image: ${err.message}`)
      setError("Failed to upload image: " + (err.message || "Unknown error"))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveImage = async () => {
    if (!profileImageUrl) return

    const confirmRemove = window.confirm("Are you sure you want to remove your profile image?")
    if (!confirmRemove) return

    setUploadingImage(true)
    setError(null)
    setSuccess(null)

    try {
      // Initialize Firebase
      const { initializeFirebase } = await import("../../lib/firebase-client")
      const firebaseResult = await initializeFirebase()

      if (!firebaseResult.success || !firebaseResult.db) {
        throw new Error("Failed to initialize Firebase")
      }

      // Import Firestore functions
      const { doc, updateDoc } = await import("firebase/firestore")

      // Update the profile to remove the image URL
      await updateDoc(doc(firebaseResult.db, "notaries", user.uid), {
        profileImageUrl: null,
      })

      // Update local state
      setProfileImageUrl("")
      setSuccess("Profile image removed successfully!")
    } catch (err: any) {
      setError("Failed to remove image: " + (err.message || "Unknown error"))
    } finally {
      setUploadingImage(false)
    }
  }

  const handleServiceToggle = (service: string) => {
    setProfile((prev) => {
      const services = [...prev.services]

      if (services.includes(service)) {
        return {
          ...prev,
          services: services.filter((s) => s !== service),
        }
      } else {
        return {
          ...prev,
          services: [...services, service],
        }
      }
    })
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setDebugInfo([])
    checkAuth()
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="text-lg">Loading profile...</span>

        {/* Debug Information */}
        {debugInfo.length > 0 && (
          <div className="max-w-2xl w-full bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <div className="text-sm space-y-1 max-h-40 overflow-y-auto">
              {debugInfo.map((info, index) => (
                <div key={index} className="font-mono text-xs">
                  {info}
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-center space-y-2">
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              onClick={handleRetry}
              className="text-amber-700 border-amber-700 hover:bg-amber-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <Link href="/" className="font-bold text-2xl text-amber-700">
              NotaryOutlet
            </Link>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{user?.email || "Notary User"}</span>
              <Button variant="outline" size="sm" onClick={() => router.push("/notary/dashboard")}>
                Dashboard
              </Button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>

              {/* Debug Info Toggle */}
              {debugInfo.length > 0 && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                    Show Debug Information ({debugInfo.length} entries)
                  </summary>
                  <div className="mt-2 bg-gray-100 p-3 rounded text-xs font-mono max-h-40 overflow-y-auto">
                    {debugInfo.map((info, index) => (
                      <div key={index}>{info}</div>
                    ))}
                  </div>
                </details>
              )}
            </div>

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

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:grid-cols-7">
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </TabsTrigger>
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="hidden sm:inline">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="team" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Team</span>
                </TabsTrigger>
                <TabsTrigger value="payments" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span className="hidden sm:inline">Payments</span>
                </TabsTrigger>
                <TabsTrigger value="password" className="flex items-center gap-2">
                  <Key className="h-4 w-4" />
                  <span className="hidden sm:inline">Password</span>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="advanced" className="flex items-center gap-2">
                  <Sliders className="h-4 w-4" />
                  <span className="hidden sm:inline">Advanced</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Manage your general account settings</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active-status"
                        checked={profile.isActive}
                        onCheckedChange={(checked) => setProfile({ ...profile, isActive: checked })}
                      />
                      <Label htmlFor="active-status">Profile is active and visible to clients</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mobile-requests"
                        checked={profile.acceptsMobileRequests}
                        onCheckedChange={(checked) => setProfile({ ...profile, acceptsMobileRequests: checked })}
                      />
                      <Label htmlFor="mobile-requests">Accept mobile notary requests</Label>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="profile" className="space-y-6">
                <form onSubmit={handleSaveProfile}>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                    {/* Profile Image */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Profile Photo</CardTitle>
                        <CardDescription>Your profile photo will be visible to clients</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col items-center">
                          <div className="relative h-40 w-40 rounded-full overflow-hidden bg-gray-100 mb-4 border-2 border-amber-200 hover:border-amber-500 transition-colors">
                            {profileImageUrl ? (
                              <Image
                                src={profileImageUrl || "/placeholder.svg"}
                                alt="Profile"
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full w-full bg-gray-200">
                                <User className="h-20 w-20 text-gray-400" />
                              </div>
                            )}

                            {/* Overlay with upload icon on hover */}
                            <div
                              className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                              onClick={() => document.getElementById("profile-image")?.click()}
                            >
                              <Upload className="h-8 w-8 text-white" />
                            </div>
                          </div>

                          <div className="w-full space-y-2">
                            <Input
                              id="profile-image"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              disabled={uploadingImage}
                              className="hidden"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => document.getElementById("profile-image")?.click()}
                              disabled={uploadingImage}
                              className="w-full border-amber-200 hover:border-amber-500 hover:bg-amber-50"
                            >
                              {uploadingImage ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : profileImageUrl ? (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Change Photo
                                </>
                              ) : (
                                <>
                                  <Upload className="h-4 w-4 mr-2" />
                                  Upload Photo
                                </>
                              )}
                            </Button>

                            {profileImageUrl && !uploadingImage && (
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleRemoveImage}
                                className="w-full border-red-200 hover:border-red-500 hover:bg-red-50 text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove Photo
                              </Button>
                            )}

                            {/* Add progress indicator during upload */}
                            {uploadingImage && (
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div className="bg-amber-600 h-2.5 rounded-full w-3/4 animate-pulse"></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Basic Information */}
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                        <CardDescription>Your public profile details</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              value={profile.name}
                              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                              placeholder="John Doe"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="title">Professional Title</Label>
                            <Input
                              id="title"
                              value={profile.title}
                              onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                              placeholder="Certified Notary Public"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                              id="email"
                              type="email"
                              value={profile.email}
                              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                              placeholder="you@example.com"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                              id="phone"
                              value={profile.phone}
                              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                              placeholder="(555) 123-4567"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              value={profile.city}
                              onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                              placeholder="New York"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="state">State</Label>
                            <Select
                              value={profile.state}
                              onValueChange={(value) => setProfile({ ...profile, state: value })}
                            >
                              <SelectTrigger id="state">
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
                      </CardContent>
                    </Card>
                  </div>

                  {/* Bio Section - Prominent placement */}
                  <Card className="mb-6">
                    <CardHeader>
                      <CardTitle>Professional Bio</CardTitle>
                      <CardDescription>
                        Tell potential clients about your experience, specializations, and what makes you unique as a
                        notary
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          value={profile.bio}
                          onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                          placeholder="I am a certified notary public with over 5 years of experience serving clients throughout the state. I specialize in real estate transactions, loan signings, and mobile notary services. My commitment to accuracy, professionalism, and client satisfaction has earned me a reputation as a trusted notary in my community..."
                          className="min-h-[120px] resize-none"
                          maxLength={500}
                        />
                        <p className="text-xs text-gray-500">
                          {profile.bio.length}/500 characters - This will be displayed on your public profile
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Services */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Services Offered</CardTitle>
                        <CardDescription>Select the services you provide</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {AVAILABLE_SERVICES.map((service) => (
                            <div key={service} className="flex items-center space-x-2">
                              <Checkbox
                                id={`service-${service}`}
                                checked={profile.services.includes(service)}
                                onCheckedChange={() => handleServiceToggle(service)}
                              />
                              <Label htmlFor={`service-${service}`} className="text-sm">
                                {service}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Commission & Availability */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Commission & Rates</CardTitle>
                        <CardDescription>Your notary commission details and pricing</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="commission-number">Commission Number</Label>
                            <Input
                              id="commission-number"
                              value={profile.commissionNumber}
                              onChange={(e) => setProfile({ ...profile, commissionNumber: e.target.value })}
                              placeholder="123456789"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="commission-expiration">Expiration Date</Label>
                            <Input
                              id="commission-expiration"
                              type="date"
                              value={profile.commissionExpiration}
                              onChange={(e) => setProfile({ ...profile, commissionExpiration: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="hourly-rate">Hourly Rate ($)</Label>
                          <Input
                            id="hourly-rate"
                            type="number"
                            min="0"
                            value={profile.hourlyRate}
                            onChange={(e) => setProfile({ ...profile, hourlyRate: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="block mb-2">Available Days</Label>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(profile.availability).map(([day, isAvailable]) => (
                              <div key={day} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`day-${day}`}
                                  checked={isAvailable}
                                  onCheckedChange={(checked) =>
                                    setProfile({
                                      ...profile,
                                      availability: {
                                        ...profile.availability,
                                        [day]: !!checked,
                                      },
                                    })
                                  }
                                />
                                <Label htmlFor={`day-${day}`} className="capitalize">
                                  {day}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <Button type="button" variant="outline" onClick={() => router.push("/notary/dashboard")}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-amber-700 hover:bg-amber-800" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Profile
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Management</CardTitle>
                    <CardDescription>Manage your team members and collaborators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Team management features coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="payments" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Settings</CardTitle>
                    <CardDescription>Manage your payment methods and billing information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Payment settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="password" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Password & Security</CardTitle>
                    <CardDescription>Update your password and security settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" onClick={() => router.push("/notary/change-password")}>
                      Change Password
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Analytics & Insights</CardTitle>
                    <CardDescription>View your performance metrics and insights</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Analytics dashboard coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="advanced" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Advanced Settings</CardTitle>
                    <CardDescription>Advanced configuration options</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">Advanced settings coming soon...</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ClientOnly>
  )
}
