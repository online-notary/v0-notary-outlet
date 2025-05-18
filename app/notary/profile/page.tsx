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
import { ClientOnly } from "../../components/client-only"
import { AlertCircle, Loader2, Save, User, Calendar, FileText, Settings, Home, Upload, CheckCircle } from "lucide-react"
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
            await fetchNotaryProfile(user.uid)
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

  const fetchNotaryProfile = async (userId: string) => {
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
          isActive: data.isActive !== false, // Default to true if not set
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
        // Add these fields if they don't exist yet
        createdAt: serverTimestamp(),
        userId: user.uid,
        isVerified: false, // New profiles start unverified
      }

      // Save to Firestore
      await setDoc(doc(db, "notaries", user.uid), profileData, { merge: true })

      setSuccess("Profile saved successfully!")
    } catch (err: any) {
      console.error("Error saving profile:", err)
      setError(err.message || "Failed to save profile. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    setError(null)

    try {
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
    } catch (err: any) {
      console.error("Error uploading image:", err)
      setError("Failed to upload image. Please try again.")
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
        <span className="ml-2">Loading profile...</span>
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
                <Button variant="ghost" className="w-full justify-start bg-amber-50 text-amber-700" asChild>
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
              </div>
            </nav>
          </aside>

          {/* Main content area */}
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold">Manage Your Profile</h1>
              <p className="text-gray-600">Update your information to attract more clients</p>
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

            <form onSubmit={handleSaveProfile}>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                {/* Profile Image */}
                <Card>
                  <CardHeader>
                    <CardTitle>Profile Image</CardTitle>
                    <CardDescription>Upload a professional photo</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col items-center">
                      <div className="relative h-40 w-40 rounded-full overflow-hidden bg-gray-100 mb-4">
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
                      </div>

                      <div className="w-full">
                        <Label htmlFor="profile-image" className="block mb-2">
                          Upload new image
                        </Label>
                        <div className="flex items-center">
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
                            className="w-full"
                          >
                            {uploadingImage ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Uploading...
                              </>
                            ) : (
                              <>
                                <Upload className="h-4 w-4 mr-2" />
                                Choose File
                              </>
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Recommended: Square image, at least 300x300 pixels</p>
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

                    <div className="space-y-2">
                      <Label htmlFor="bio">Professional Bio</Label>
                      <Textarea
                        id="bio"
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell clients about your experience and services..."
                        className="min-h-[100px]"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

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
                    <CardTitle>Commission & Availability</CardTitle>
                    <CardDescription>Your notary commission details</CardDescription>
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

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="mobile-requests"
                        checked={profile.acceptsMobileRequests}
                        onCheckedChange={(checked) => setProfile({ ...profile, acceptsMobileRequests: checked })}
                      />
                      <Label htmlFor="mobile-requests">Accept mobile notary requests</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="active-status"
                        checked={profile.isActive}
                        onCheckedChange={(checked) => setProfile({ ...profile, isActive: checked })}
                      />
                      <Label htmlFor="active-status">Profile is active and visible to clients</Label>
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
                      Save Profile
                    </>
                  )}
                </Button>
              </div>
            </form>
          </main>
        </div>
      </div>
    </ClientOnly>
  )
}
