"use client"

import { Calendar } from "@/components/ui/calendar"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, Camera, CheckCircle, Edit, Loader2, LogOut, Save, User } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
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

export default function NotaryDashboard() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Auth and loading states
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Profile state
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    bio: "",
    commissionNumber: "",
    commissionExpiration: "",
    services: [] as string[],
    hourlyRate: "25",
    isActive: true,
    acceptsMobileRequests: true,
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

  // Profile image state
  const [profileImageUrl, setProfileImageUrl] = useState<string>("")
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Import Firebase auth
        const { getFirebaseAuth } = await import("../lib/firebase-client")
        const auth = await getFirebaseAuth()

        if (!auth) {
          throw new Error("Authentication is not available")
        }

        // Listen for auth state changes
        const unsubscribe = auth.onAuthStateChanged(async (user: any) => {
          if (user) {
            setUser(user)
            await fetchNotaryProfile(user.uid)
          } else {
            // Redirect to login if not logged in
            router.push("/login")
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

  // Fetch notary profile from Firestore
  const fetchNotaryProfile = async (userId: string) => {
    try {
      setError(null)

      // Initialize Firebase
      const { initializeFirebase } = await import("../lib/firebase-client")
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

        // Update profile state with data from Firestore
        setProfile({
          name: data.name || "",
          email: data.email || user?.email || "",
          phone: data.phone || "",
          address: data.address || "",
          city: data.city || "",
          state: data.state || "",
          zip: data.zip || "",
          bio: data.bio || "",
          commissionNumber: data.commissionNumber || "",
          commissionExpiration: data.commissionExpiration || "",
          services: data.services || [],
          hourlyRate: data.hourlyRate?.toString() || "25",
          isActive: data.isActive !== false, // Default to true if not set
          acceptsMobileRequests: data.acceptsMobileRequests !== false,
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
        }
      } else {
        // If no profile exists yet, pre-fill with user email
        setProfile((prev) => ({
          ...prev,
          email: user?.email || "",
        }))
      }
    } catch (err: any) {
      console.error("Error fetching notary profile:", err)
      setError("Failed to load your profile. Please try again.")
    }
  }

  // Handle profile save
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      if (!user?.uid) {
        throw new Error("You must be logged in to save your profile")
      }

      // Initialize Firebase
      const { initializeFirebase } = await import("../lib/firebase-client")
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
        // Add these fields if they don't exist yet
        createdAt: serverTimestamp(),
        userId: user.uid,
        isVerified: false, // New profiles start unverified
      }

      // Save to Firestore
      await setDoc(doc(db, "notaries", user.uid), profileData, { merge: true })

      setSuccess("Profile saved successfully!")

      // Clear any temporary image preview
      setImagePreview(null)
    } catch (err: any) {
      console.error("Error saving profile:", err)
      setError(err.message || "Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  // Handle image file selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Create a preview URL
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  // Handle image upload to Firebase Storage
  const handleImageUpload = async () => {
    if (!imagePreview) return

    setUploadingImage(true)
    setError(null)

    try {
      // Get the file from the input
      const file = fileInputRef.current?.files?.[0]
      if (!file) throw new Error("No file selected")

      // Initialize Firebase
      const { initializeFirebase } = await import("../lib/firebase-client")
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
      setSuccess("Profile image uploaded successfully!")
    } catch (err: any) {
      console.error("Error uploading image:", err)
      setError("Failed to upload image. Please try again.")
    } finally {
      setUploadingImage(false)
    }
  }

  // Handle service toggle
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

  // Handle logout
  const handleLogout = async () => {
    try {
      const { getFirebaseAuth } = await import("../lib/firebase-client")
      const auth = await getFirebaseAuth()

      if (auth) {
        await auth.signOut()
        router.push("/login")
      }
    } catch (err: any) {
      console.error("Logout error:", err)
      setError(err.message || "Failed to log out")
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="font-bold text-2xl text-amber-700">NotaryOutlet</h1>
            <Badge variant="outline" className="ml-4">
              Dashboard
            </Badge>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:inline-block">{user?.email || "Notary User"}</span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Sidebar with profile image */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Profile Image</CardTitle>
                  <CardDescription>Upload a professional photo</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <div className="relative h-48 w-48 rounded-full overflow-hidden bg-gray-100 mb-4">
                    {imagePreview ? (
                      <Image
                        src={imagePreview || "/placeholder.svg"}
                        alt="Profile Preview"
                        fill
                        className="object-cover"
                      />
                    ) : profileImageUrl ? (
                      <Image src={profileImageUrl || "/placeholder.svg"} alt="Profile" fill className="object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-gray-200">
                        <User className="h-24 w-24 text-gray-400" />
                      </div>
                    )}

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className="absolute bottom-2 right-2 bg-white rounded-full"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Update Profile Picture</DialogTitle>
                          <DialogDescription>Upload a professional photo for your notary profile.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="flex flex-col items-center">
                            {imagePreview && (
                              <div className="relative h-48 w-48 rounded-full overflow-hidden bg-gray-100 mb-4">
                                <Image
                                  src={imagePreview || "/placeholder.svg"}
                                  alt="Preview"
                                  fill
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <Input
                              id="profile-image"
                              type="file"
                              accept="image/*"
                              ref={fileInputRef}
                              onChange={handleImageSelect}
                              className="max-w-sm"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              Recommended: Square image, at least 300x300 pixels
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setImagePreview(null)}>
                            Cancel
                          </Button>
                          <Button
                            type="button"
                            onClick={handleImageUpload}
                            disabled={!imagePreview || uploadingImage}
                            className="bg-amber-700 hover:bg-amber-800"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              "Upload Image"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="text-center">
                    <h3 className="font-medium text-lg">{profile.name || "Your Name"}</h3>
                    <p className="text-gray-500 text-sm">Notary Public</p>
                    {profile.state && (
                      <Badge variant="outline" className="mt-2">
                        {profile.state}
                      </Badge>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="w-full">
                    <h4 className="font-medium mb-2">Profile Status</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Active Status</span>
                      <Switch
                        checked={profile.isActive}
                        onCheckedChange={(checked) => setProfile({ ...profile, isActive: checked })}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {profile.isActive ? "Your profile is visible to clients" : "Your profile is hidden from clients"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Main profile form */}
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>Update your professional information</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile}>
                    <div className="space-y-6">
                      {/* Personal Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Personal Information</h3>
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
                      </div>

                      {/* Address Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Address Information</h3>
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="address">Street Address</Label>
                            <Input
                              id="address"
                              value={profile.address}
                              onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                              placeholder="123 Main St"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="city">City</Label>
                              <Input
                                id="city"
                                value={profile.city}
                                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                                placeholder="New York"
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

                            <div className="space-y-2">
                              <Label htmlFor="zip">ZIP Code</Label>
                              <Input
                                id="zip"
                                value={profile.zip}
                                onChange={(e) => setProfile({ ...profile, zip: e.target.value })}
                                placeholder="10001"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Professional Information */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Professional Information</h3>
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
                            <Label htmlFor="commission-expiration">Commission Expiration</Label>
                            <Input
                              id="commission-expiration"
                              type="date"
                              value={profile.commissionExpiration}
                              onChange={(e) => setProfile({ ...profile, commissionExpiration: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="bio">Professional Bio</Label>
                            <Textarea
                              id="bio"
                              value={profile.bio}
                              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                              placeholder="Tell clients about your experience and services..."
                              className="min-h-[100px]"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Services & Rates */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Services & Rates</h3>
                        <div className="grid grid-cols-1 gap-4">
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
                            <Label className="block mb-2">Services Offered</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {AVAILABLE_SERVICES.map((service) => (
                                <div key={service} className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id={`service-${service}`}
                                    checked={profile.services.includes(service)}
                                    onChange={() => handleServiceToggle(service)}
                                    className="rounded border-gray-300 text-amber-700 focus:ring-amber-700"
                                  />
                                  <Label htmlFor={`service-${service}`} className="text-sm">
                                    {service}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="mobile-requests"
                              checked={profile.acceptsMobileRequests}
                              onCheckedChange={(checked) => setProfile({ ...profile, acceptsMobileRequests: checked })}
                            />
                            <Label htmlFor="mobile-requests">Accept mobile notary requests</Label>
                          </div>
                        </div>
                      </div>

                      {/* Availability */}
                      <div>
                        <h3 className="text-lg font-medium mb-4">Availability</h3>
                        <div className="space-y-2">
                          <Label className="block mb-2">Available Days</Label>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {Object.entries(profile.availability).map(([day, isAvailable]) => (
                              <div key={day} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`day-${day}`}
                                  checked={isAvailable}
                                  onChange={() =>
                                    setProfile({
                                      ...profile,
                                      availability: {
                                        ...profile.availability,
                                        [day]: !isAvailable,
                                      },
                                    })
                                  }
                                  className="rounded border-gray-300 text-amber-700 focus:ring-amber-700"
                                />
                                <Label htmlFor={`day-${day}`} className="capitalize text-sm">
                                  {day}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 flex justify-end">
                      <Button type="submit" className="bg-amber-700 hover:bg-amber-800" disabled={saving}>
                        {saving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Profile
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Other tabs (placeholders) */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
                <CardDescription>Manage your upcoming and past appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No Appointments Yet</h3>
                  <p className="text-gray-500 max-w-md mt-2">
                    You don't have any appointments scheduled. They will appear here once clients book your services.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
                <CardDescription>Manage your notarized documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Edit className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium">No Documents Yet</h3>
                  <p className="text-gray-500 max-w-md mt-2">
                    You haven't notarized any documents yet. They will appear here once you complete notarizations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="email-notifications" className="text-base">
                            Email Notifications
                          </Label>
                          <p className="text-sm text-gray-500">Receive notifications about new appointments</p>
                        </div>
                        <Switch id="email-notifications" defaultChecked />
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="sms-notifications" className="text-base">
                            SMS Notifications
                          </Label>
                          <p className="text-sm text-gray-500">Receive text messages about new appointments</p>
                        </div>
                        <Switch id="sms-notifications" />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Security</h3>
                    <Button variant="outline">Change Password</Button>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Account Management</h3>
                    <Button variant="destructive">Delete Account</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
