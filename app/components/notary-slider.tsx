"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react"
import { ClientOnly } from "./client-only"
import { PriceBadge } from "./price-badge"
import { getVerifiedNotaries } from "../data/notaries"
import type { Notary } from "../data/notaries"

function NotarySliderContent() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [visibleCount, setVisibleCount] = useState(3)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchNotaries = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const fetchedNotaries = await getVerifiedNotaries(10)
        if (Array.isArray(fetchedNotaries)) {
          setNotaries(fetchedNotaries)
        } else {
          setError("Received invalid data format from the server.")
        }
      } catch (err) {
        setError(`Failed to load notaries: ${err instanceof Error ? err.message : "Unknown error"}`)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNotaries()
  }, [])

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
    if (notaries.length <= visibleCount) return
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? notaries.length - visibleCount : prevIndex - 1
    )
  }, [notaries.length, visibleCount])

  const scrollNext = useCallback(() => {
    if (notaries.length <= visibleCount) return
    setCurrentIndex((prevIndex) =>
      prevIndex >= notaries.length - visibleCount ? 0 : prevIndex + 1
    )
  }, [notaries.length, visibleCount])

  const visibleNotaries = useCallback(() => {
    if (notaries.length === 0) return []
    if (notaries.length <= visibleCount) return notaries

    return Array.from({ length: visibleCount }, (_, i) => {
      const index = (currentIndex + i) % notaries.length
      return notaries[index]
    })
  }, [currentIndex, notaries, visibleCount])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (notaries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-gray-500">No verified notaries available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="overflow-hidden">
        <div className="flex transition-transform duration-300 gap-4">
          {visibleNotaries().map((notary) => (
            <div key={notary.id} className="flex-1 min-w-0">
              <Card className="h-full overflow-hidden shadow-md">
                <div className="relative h-48 w-full bg-gray-100">
                  <Image
                    src={
                      notary.profileImageUrl ||
                      `/placeholder.svg?height=300&width=500&query=professional notary ${notary.id}`
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
      {notaries.length > visibleCount && (
        <>
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
        </>
      )}
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
