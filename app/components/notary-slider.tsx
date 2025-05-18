"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { ClientOnly } from "./client-only"
import { PriceBadge } from "./price-badge"

// Mock notary data
const mockNotaries = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Certified Notary Public",
    location: "New York, NY",
    rating: 5,
    reviews: 24,
    services: ["Loan Documents", "Real Estate", "Mobile Service"],
    isVerified: true,
    profileImageUrl: null,
  },
  {
    id: "2",
    name: "Michael Smith",
    title: "Mobile Notary",
    location: "Los Angeles, CA",
    rating: 5,
    reviews: 18,
    services: ["Power of Attorney", "Affidavits", "Wills & Trusts"],
    isVerified: true,
    profileImageUrl: null,
  },
  {
    id: "3",
    name: "Emily Davis",
    title: "Certified Notary Public",
    location: "Chicago, IL",
    rating: 4,
    reviews: 15,
    services: ["Real Estate", "Loan Documents", "Acknowledgments"],
    isVerified: true,
    profileImageUrl: null,
  },
  {
    id: "4",
    name: "David Wilson",
    title: "Notary Signing Agent",
    location: "Houston, TX",
    rating: 5,
    reviews: 32,
    services: ["Loan Signing", "Mobile Service", "Same-Day Available"],
    isVerified: true,
    profileImageUrl: null,
  },
  {
    id: "5",
    name: "Jennifer Lee",
    title: "Professional Notary",
    location: "Miami, FL",
    rating: 5,
    reviews: 27,
    services: ["Apostille", "Oaths & Affirmations", "Jurats"],
    isVerified: true,
    profileImageUrl: null,
  },
]

function NotarySliderContent() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notaries] = useState(mockNotaries)
  const [visibleCount, setVisibleCount] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1)
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2)
      } else {
        setVisibleCount(3)
      }
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const scrollPrev = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? notaries.length - visibleCount : prevIndex - 1))
  }, [notaries.length, visibleCount])

  const scrollNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex >= notaries.length - visibleCount ? 0 : prevIndex + 1))
  }, [notaries.length, visibleCount])

  const visibleNotaries = useCallback(() => {
    const result = []
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % notaries.length
      result.push(notaries[index])
    }
    return result
  }, [currentIndex, notaries, visibleCount])

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-300 gap-4">
          {visibleNotaries().map((notary) => (
            <div key={notary.id} className={`flex-1 min-w-0`}>
              <Card className="h-full overflow-hidden shadow-md">
                <div className="relative h-48 w-full bg-gray-100">
                  <Image
                    src={
                      notary.profileImageUrl ||
                      `/placeholder.svg?height=300&width=500&query=professional notary ${notary.id || "/placeholder.svg"}`
                    }
                    alt={notary.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <PriceBadge size="sm" className="transform hover:scale-105 transition-transform" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center mb-1">
                    <h3 className="font-semibold text-lg mr-2">{notary.name}</h3>
                    {notary.isVerified && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{notary.title}</p>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span>{notary.location}</span>
                  </div>
                  <div className="flex items-center text-sm text-amber-500 mb-3">
                    {Array(notary.rating)
                      .fill(0)
                      .map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-current" />
                      ))}
                    <span className="ml-1 text-gray-600">({notary.reviews} reviews)</span>
                  </div>
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {notary.services.slice(0, 3).map((service, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button asChild className="w-full bg-amber-700 hover:bg-amber-800">
                    <Link href={`/notary/${notary.id}`}>View Profile</Link>
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full z-10"
        onClick={scrollPrev}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>
      <Button
        variant="outline"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full z-10"
        onClick={scrollNext}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>
    </div>
  )
}

export function NotarySlider() {
  return (
    <ClientOnly
      fallback={
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
        </div>
      }
    >
      <NotarySliderContent />
    </ClientOnly>
  )
}
