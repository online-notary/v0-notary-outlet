"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Phone, Mail, Calendar, Clock, ArrowLeft, Star, FileText } from "lucide-react"
import { getNotaryById } from "@/app/data/notaries"
import type { Notary } from "@/app/data/notaries"

export default function NotaryProfilePage({ params }: { params: { id: string } }) {
  const [notary, setNotary] = useState<Notary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchNotary = async () => {
      try {
        const notaryData = await getNotaryById(params.id)

        if (notaryData) {
          // Check if the notary is active (visible)
          if (!notaryData.isActive) {
            setError("This notary is not currently available.")
          } else {
            setNotary(notaryData)
          }
        } else {
          setError("Notary not found. The notary you're looking for doesn't exist or has been removed.")
        }
      } catch (error) {
        console.error("Error fetching notary:", error)
        setError("Failed to load notary information. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotary()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="mb-6 text-gray-600">{error}</p>
          <Link href="/notaries" className="text-amber-700 hover:underline">
            Return to Notary Directory
          </Link>
        </div>
      </div>
    )
  }

  if (!notary) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Notary Not Found</h1>
          <p className="mb-6">The notary you're looking for doesn't exist or has been removed.</p>
          <Link href="/notaries" className="text-amber-700 hover:underline">
            Return to Notary Directory
          </Link>
        </div>
      </div>
    )
  }

  // Format availability for display
  const formattedAvailability = notary.availability
    ? notary.availability
        .filter((slot) => slot.available)
        .map((slot) => ({
          day: slot.day,
          hours: `${slot.startTime} - ${slot.endTime}`,
        }))
    : [
        { day: "Monday", hours: "9:00 AM - 5:00 PM" },
        { day: "Tuesday", hours: "9:00 AM - 5:00 PM" },
        { day: "Wednesday", hours: "9:00 AM - 5:00 PM" },
        { day: "Thursday", hours: "9:00 AM - 5:00 PM" },
        { day: "Friday", hours: "9:00 AM - 5:00 PM" },
        { day: "Saturday", hours: "10:00 AM - 2:00 PM" },
      ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Announcement Bar */}
      <div className="bg-amber-700 text-white text-center py-2 px-4 text-sm font-medium">
        All notaries just $5 per signature - No hidden fees!
      </div>

      {/* Header/Navigation */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="font-bold text-2xl text-amber-700">
              NotaryOutlet
            </Link>
            <Badge variant="outline" className="bg-green-600 text-white border-green-500">
              $5 Flat Rate
            </Badge>
          </div>
          <nav className="hidden md:flex space-x-6">
            <Link href="/#how-it-works" className="text-gray-600 hover:text-amber-700 font-medium">
              How It Works
            </Link>
            <Link href="/#find-notary" className="text-gray-600 hover:text-amber-700 font-medium">
              Find a Notary
            </Link>
            <Link href="/#testimonials" className="text-gray-600 hover:text-amber-700 font-medium">
              Testimonials
            </Link>
            <Link href="/#faq" className="text-gray-600 hover:text-amber-700 font-medium">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center space-x-3">
            <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-50" asChild>
              <Link href="/notary/login">Notary Login</Link>
            </Button>
            <Button className="bg-amber-700 hover:bg-amber-800">Book Now</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Link href="/notaries" className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Notary Directory
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="relative h-64 w-full bg-gray-100">
                <Image
                  src={
                    notary.profileImageUrl ||
                    `/placeholder.svg?height=500&width=500&query=professional notary ${notary.id || "/placeholder.svg"}`
                  }
                  alt={notary.name}
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h1 className="text-2xl font-bold">{notary.name}</h1>
                  <div className="bg-green-600 text-white font-bold px-3 py-1 rounded-full text-sm">$5</div>
                </div>
                <p className="text-gray-500 mb-4">{notary.title}</p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-3 flex-shrink-0 text-amber-700" />
                    <span>{notary.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Phone className="h-5 w-5 mr-3 flex-shrink-0 text-amber-700" />
                    <span>{notary.phone}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Mail className="h-5 w-5 mr-3 flex-shrink-0 text-amber-700" />
                    <span>{notary.email}</span>
                  </div>
                </div>

                <div className="flex items-center mb-6">
                  <div className="flex text-amber-500">
                    {Array(notary.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-current" />
                      ))}
                  </div>
                  <span className="ml-2 text-gray-600">({notary.reviews} reviews)</span>
                </div>

                <Button className="w-full bg-amber-700 hover:bg-amber-800">Book Appointment</Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="md:col-span-2">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">About Me</h2>
                <p className="text-gray-600">{notary.bio}</p>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Services Offered</h2>
                <div className="flex flex-wrap gap-2">
                  {notary.services.map((service, index) => (
                    <div key={index} className="flex items-center bg-gray-100 px-3 py-2 rounded-lg text-gray-700">
                      <FileText className="h-4 w-4 mr-2 text-amber-700" />
                      {service}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Availability</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formattedAvailability.map((slot, index) => (
                    <div key={index} className="flex items-center justify-between border-b pb-2">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-amber-700" />
                        <span className="font-medium">{slot.day}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-amber-700" />
                        <span>{slot.hours}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">NotaryOutlet</h3>
              <p className="mb-4">Professional $5 notary services nationwide.</p>
              <div className="flex items-center">
                <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-2">
                  $5
                </div>
                <span>Flat rate guarantee</span>
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/notaries" className="hover:text-amber-500">
                    Find a Notary
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Mobile Notary
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Become a Notary
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Business Services
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Press
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
            <p>&copy; {new Date().getFullYear()} NotaryOutlet. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
