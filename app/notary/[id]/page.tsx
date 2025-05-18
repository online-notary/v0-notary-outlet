"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientOnly } from "../../components/client-only"
import { AlertCircle, ArrowLeft, CheckCircle, MapPin, Phone, Mail, Clock, Award, MapPinned, Coffee } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "../../components/header"
import { PriceBadge } from "../../components/price-badge"

// Format phone number to (XXX) XXX-XXXX
const formatPhoneNumber = (phoneNumberString: string | undefined): string => {
  if (!phoneNumberString) return ""
  const cleaned = phoneNumberString.replace(/\D/g, "")
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phoneNumberString
}

// List of special routes that should be handled by dedicated pages
const SPECIAL_ROUTES = [
  "dashboard",
  "profile",
  "settings",
  "admin",
  "appointments",
  "documents",
  "services",
  "change-password",
  "login",
  "register",
  "pending-approval",
]

export default function NotaryProfilePage() {
  const router = useRouter()
  const params = useParams()
  const notaryId = params.id as string

  const [loading, setLoading] = useState(true)
  const [notary, setNotary] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [messageSent, setMessageSent] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [availability, setAvailability] = useState<any[]>([])

  // Contact form state
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    subject: "General Inquiry",
  })

  // Handle special routes immediately on component mount
  useEffect(() => {
    if (SPECIAL_ROUTES.includes(notaryId)) {
      console.log(`[NotaryProfile] Detected special route: ${notaryId}`)
      setRedirecting(true)

      // Use router.push for Next.js navigation
      router.push(`/notary/${notaryId}`)

      // As a fallback, also use window.location after a short delay
      setTimeout(() => {
        window.location.href = `/notary/${notaryId}`
      }, 100)
    }
  }, [notaryId, router])

  useEffect(() => {
    // Skip fetching if this is a special route
    if (SPECIAL_ROUTES.includes(notaryId)) {
      return
    }

    const fetchNotaryProfile = async () => {
      try {
        setLoading(true)
        console.log(`[NotaryProfile] Fetching notary with ID: ${notaryId}`)

        // Import firebase client services
        const { initializeFirebase, getFirebaseServices } = await import("../../lib/firebase-client")
        await initializeFirebase()
        const { db } = getFirebaseServices()

        if (!db) {
          throw new Error("Firebase Firestore not initialized properly")
        }

        const { doc, getDoc, collection, getDocs, query, where } = await import("firebase/firestore")

        // First try to get the notary directly from the notaries collection
        const notaryDocRef = doc(db, "notaries", notaryId)
        const notaryDocSnap = await getDoc(notaryDocRef)

        if (notaryDocSnap.exists()) {
          const notaryData = notaryDocSnap.data()
          console.log(`[NotaryProfile] Found notary in notaries collection:`, notaryData)

          // Process availability data if it exists
          let availabilityData = []
          if (notaryData.availability && Array.isArray(notaryData.availability)) {
            availabilityData = notaryData.availability.map((slot: any) => ({
              day: slot.day || "Not specified",
              hours: slot.available ? `${slot.startTime || "09:00"} - ${slot.endTime || "17:00"}` : "Not available",
              available: slot.available,
            }))
          }

          setAvailability(availabilityData)

          setNotary({
            id: notaryDocSnap.id,
            name: notaryData.name || "Unknown Notary",
            title: notaryData.title || "Certified Notary Public",
            location: notaryData.address || notaryData.location || "Location not provided",
            phone: notaryData.phone || "Phone not provided",
            email: notaryData.email || "Email not provided",
            rating: notaryData.rating || 5,
            reviews: notaryData.reviews || 0,
            bio: notaryData.bio || "No bio provided",
            services: notaryData.services || ["General Notary Services"],
            isVerified: notaryData.isVerified || false,
            isActive: notaryData.isActive !== false,
            profileImageUrl: notaryData.profileImageUrl || null,
          })
          setLoading(false)
          return
        }

        // If not found in notaries collection, try users collection
        const userDocRef = doc(db, "users", notaryId)
        const userDocSnap = await getDoc(userDocRef)

        if (userDocSnap.exists()) {
          const userData = userDocSnap.data()
          console.log(`[NotaryProfile] Found user in users collection:`, userData)

          if (userData.role === "notary" || userData.isNotary === true) {
            // Try to get availability data from a subcollection if it exists
            let availabilityData = []
            try {
              const availabilityCollectionRef = collection(db, "users", notaryId, "availability")
              const availabilitySnapshot = await getDocs(availabilityCollectionRef)

              if (!availabilitySnapshot.empty) {
                availabilityData = availabilitySnapshot.docs.map((doc) => {
                  const data = doc.data()
                  return {
                    day: data.day || "Not specified",
                    hours: data.available
                      ? `${data.startTime || "09:00"} - ${data.endTime || "17:00"}`
                      : "Not available",
                    available: data.available,
                  }
                })
              }
            } catch (err) {
              console.log("[NotaryProfile] No availability subcollection found:", err)
              // Default availability if none found
              availabilityData = [
                { day: "Monday", hours: "9:00 AM - 5:00 PM", available: true },
                { day: "Tuesday", hours: "9:00 AM - 5:00 PM", available: true },
                { day: "Wednesday", hours: "9:00 AM - 5:00 PM", available: true },
                { day: "Thursday", hours: "9:00 AM - 5:00 PM", available: true },
                { day: "Friday", hours: "9:00 AM - 5:00 PM", available: true },
                { day: "Saturday", hours: "Not available", available: false },
                { day: "Sunday", hours: "Not available", available: false },
              ]
            }

            setAvailability(availabilityData)

            setNotary({
              id: userDocSnap.id,
              name: userData.fullName || userData.name || "Unknown Notary",
              title: userData.title || "Certified Notary Public",
              location: userData.address || userData.location || userData.state || "Location not provided",
              phone: userData.phone || "Phone not provided",
              email: userData.email || "Email not provided",
              rating: userData.rating || 5,
              reviews: userData.reviews || 0,
              bio: userData.bio || "No bio provided",
              services: userData.services || ["General Notary Services"],
              isVerified: userData.isVerified || false,
              isActive: userData.isActive !== false,
              profileImageUrl: userData.profileImageUrl || null,
            })
            setLoading(false)
            return
          }
        }

        // If we get here, we couldn't find the notary
        throw new Error(`Notary with ID ${notaryId} not found`)
      } catch (err: any) {
        console.error("[NotaryProfile] Error fetching notary:", err)
        setError(err.message || "Failed to load notary profile")
      } finally {
        setLoading(false)
      }
    }

    if (notaryId && !SPECIAL_ROUTES.includes(notaryId)) {
      fetchNotaryProfile()
    }
  }, [notaryId, router])

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real app, you would send this data to your backend
    console.log("Contact form submitted:", contactForm)
    setMessageSent(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setMessageSent(false)
      setContactForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        subject: "General Inquiry",
      })
    }, 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setContactForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // If this is a special route, show a loading indicator while redirecting
  if (SPECIAL_ROUTES.includes(notaryId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        <span className="ml-2 text-amber-700">Redirecting to {notaryId}...</span>
      </div>
    )
  }

  // If we're redirecting to another page, show a loading indicator
  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        <span className="ml-2 text-amber-700">Redirecting to {notaryId}...</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        <span className="ml-2 text-amber-700">Loading notary profile...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.back()} className="bg-amber-700 hover:bg-amber-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  // If notary is null, don't render the profile content
  if (!notary) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Notary profile not found</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button onClick={() => router.back()} className="bg-amber-700 hover:bg-amber-800">
            <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Mock signing types (in a real app, this would come from the database)
  const signingTypes = [
    { category: "General Notarizations", items: ["Affidavits", "Acknowledgments", "Jurats", "Oaths"] },
    { category: "Debt Settlement Signings", items: [] },
    { category: "Reverse Mortgage Documents", items: [] },
  ]

  // Mock signing locations (in a real app, this would come from the database)
  const signingLocations = [
    "At My Office",
    "Client's Home or Office",
    "Public Places (Coffee Shops, Libraries)",
    "Hospitals and Care Facilities",
  ]

  // Mock accommodations (in a real app, this would come from the database)
  const accommodations = [
    { name: "Starbucks", icon: <Coffee className="h-4 w-4" /> },
    { name: "Electronic Notarization", icon: <CheckCircle className="h-4 w-4" /> },
    { name: "Remote Online Notarization (RON)", icon: <CheckCircle className="h-4 w-4" /> },
  ]

  // Mock accreditations (in a real app, this would come from the database)
  const accreditations = [
    "NNA Certified Signing Agent",
    "Texas Commissioned Notary",
    "State Approved Title Agent",
    "Bonded and Insured",
  ]

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50">
        <Header />

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/notaries" className="inline-flex items-center text-amber-700 hover:text-amber-800">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Notaries
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left column - Notary info */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Profile photo */}
                  <div className="flex-shrink-0">
                    <div className="relative h-32 w-32 rounded-full overflow-hidden">
                      <Image
                        src={
                          notary.profileImageUrl || `/placeholder.svg?height=128&width=128&query=professional headshot`
                        }
                        alt={notary.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="mt-2 flex justify-center">
                      <PriceBadge size="md" className="transform hover:scale-105 transition-transform" />
                    </div>
                  </div>

                  {/* Basic info */}
                  <div className="flex-grow">
                    <h1 className="text-2xl font-bold text-gray-800 uppercase">{notary.name}</h1>
                    <p className="text-gray-600">{notary.title || "Certified Notary Public"}</p>

                    <div className="mt-2 flex items-center text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{notary.location}</span>
                    </div>

                    <div className="mt-1 flex items-center text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <a
                        href={`tel:${notary.phone?.replace(/\D/g, "") || "5551234567"}`}
                        className="hover:text-amber-700"
                      >
                        {formatPhoneNumber(notary.phone) || "(555) 123-4567"}
                      </a>
                    </div>

                    <div className="mt-1 flex items-center text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span>{notary.email}</span>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {notary.services &&
                        notary.services.slice(0, 3).map((service: string, index: number) => (
                          <span key={index} className="bg-amber-100 text-amber-800 px-2 py-1 rounded-full text-xs">
                            {service}
                          </span>
                        ))}
                      {notary.services && notary.services.length > 3 && (
                        <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">
                          +{notary.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <div>
                    <h2 className="font-semibold text-gray-800">
                      Licensed Notary: {notary.location.split(", ")[1] || notary.location}
                    </h2>
                    <p className="text-sm text-gray-600">Languages Spoken: English</p>
                    <p className="text-sm text-gray-600">Notary Experience: 3+ Years</p>
                    <p className="text-sm text-gray-600">E&O Insured: Yes</p>
                  </div>

                  <div>
                    <p className="text-gray-700">{notary.bio}</p>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Availability</h2>
                <div className="grid grid-cols-1 gap-2">
                  {availability.length > 0 ? (
                    availability.map((slot, index) => (
                      <div key={index} className="flex border rounded-md overflow-hidden">
                        <div className="bg-gray-100 w-32 py-2 px-4 font-medium text-gray-700">{slot.day}</div>
                        <div
                          className={`flex-grow py-2 px-4 flex items-center ${!slot.available ? "text-gray-400" : ""}`}
                        >
                          <Clock className={`h-4 w-4 mr-2 ${slot.available ? "text-gray-500" : "text-gray-300"}`} />
                          <span>{slot.hours}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No availability information provided</p>
                  )}
                </div>
              </div>

              {/* Types of Signings */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Types of Signings Performed</h2>
                <p className="mb-4 text-gray-700">{notary.name} specializes in the following types of documents:</p>

                <div className="space-y-4">
                  {signingTypes.map((category, index) => (
                    <div key={index}>
                      <h3 className="font-semibold text-gray-800">{category.category}</h3>
                      {category.items.length > 0 && (
                        <ul className="list-disc pl-5 mt-2">
                          {category.items.map((item, idx) => (
                            <li key={idx} className="text-gray-600">
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Signing Locations */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Signing Locations</h2>
                <p className="mb-4 text-gray-700">{notary.name} meets clients at:</p>

                <ul className="space-y-2">
                  {signingLocations.map((location, index) => (
                    <li key={index} className="flex items-start">
                      <MapPinned className="h-5 w-5 mr-2 text-amber-700 flex-shrink-0 mt-0.5" />
                      <span>{location}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Signing Accommodations */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Signing Accommodations</h2>
                <p className="mb-4 text-gray-700">{notary.name} can accommodate:</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accommodations.map((accommodation, index) => (
                    <div key={index} className="flex items-center">
                      <div className="mr-2 text-amber-700">{accommodation.icon}</div>
                      <span>{accommodation.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accreditations */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Accreditations</h2>
                <p className="mb-4 text-gray-700">{notary.name} has the following accreditations:</p>

                <div className="space-y-2">
                  {accreditations.map((accreditation, index) => (
                    <div key={index} className="flex items-center">
                      <Award className="h-5 w-5 mr-2 text-amber-700" />
                      <span>{accreditation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Contact form */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="p-6">
                  <h2 className="text-center text-xl font-bold mb-4">Connect with {notary.name}</h2>

                  <div className="flex justify-center mb-4">
                    <PriceBadge size="md" className="transform hover:scale-105 transition-transform" />
                  </div>

                  {messageSent ? (
                    <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                      <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
                      <h3 className="font-semibold text-green-800">Message Sent!</h3>
                      <p className="text-green-700 text-sm">{notary.name} will get back to you shortly.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4">
                      <div>
                        <Input
                          placeholder="Name"
                          name="name"
                          value={contactForm.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Input
                          placeholder="Email"
                          type="email"
                          name="email"
                          value={contactForm.email}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Input
                          placeholder="Phone"
                          type="tel"
                          name="phone"
                          value={contactForm.phone}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div>
                        <Select
                          name="subject"
                          value={contactForm.subject}
                          onValueChange={(value) => setContactForm((prev) => ({ ...prev, subject: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                            <SelectItem value="Loan Signing">Loan Signing</SelectItem>
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                            <SelectItem value="Power of Attorney">Power of Attorney</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Textarea
                          placeholder="Your message for this notary"
                          name="message"
                          value={contactForm.message}
                          onChange={handleInputChange}
                          className="min-h-[100px]"
                          required
                        />
                      </div>

                      <Button type="submit" className="w-full bg-amber-700 hover:bg-amber-800">
                        Send Message
                      </Button>
                    </form>
                  )}

                  <div className="mt-6 text-center">
                    <p className="text-sm text-gray-500">
                      Or call directly:{" "}
                      <a
                        href={`tel:${notary.phone?.replace(/\D/g, "") || "5551234567"}`}
                        className="text-amber-700 font-semibold"
                      >
                        {formatPhoneNumber(notary.phone) || "(555) 123-4567"}
                      </a>
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t py-6 mt-8">
          <div className="container mx-auto px-4 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} NotaryOutlet. All rights reserved.
          </div>
        </footer>
      </div>
    </ClientOnly>
  )
}
