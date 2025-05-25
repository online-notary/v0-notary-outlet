"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, Star } from "lucide-react"
import { PriceBadge } from "./price-badge"
import { ClientOnly } from "./client-only"
import { getActiveNotaries, type Notary } from "@/app/data/notaries"

// Default notary images for fallback
const defaultImages = [
  "/female-notary-office.png",
  "/notary-signing-documents.png",
  "/female-notary-client.png",
  "/notary-signing.png",
  "/notary-with-client.png",
  "/male-notary.png",
  "/notary-signing-agent.png",
]

interface CubeSliderProps {
  heroMode?: boolean
}

export default function CubeSlider({ heroMode = false }: CubeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [autoplayPaused, setAutoplayPaused] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [notaries, setNotaries] = useState<Notary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchNotaries = async () => {
      try {
        console.log("Fetching active notaries for cube slider...")
        setLoading(true)
        setError(null)

        // Get active notaries (now always returns mock data to avoid permission errors)
        const data = await getActiveNotaries(10)

        // Ensure we have images for all notaries
        const dataWithImages = data.map((notary, index) => {
          if (!notary.profileImageUrl) {
            return {
              ...notary,
              profileImageUrl: defaultImages[index % defaultImages.length],
            }
          }
          return notary
        })

        console.log(`Fetched ${dataWithImages.length} active notaries for cube slider`)
        setNotaries(dataWithImages)
      } catch (error: any) {
        console.error("Failed to fetch active notaries for cube slider", error)
        setError("Failed to load notaries. Using sample data.")

        // Create fallback mock data
        const mockData = Array(4)
          .fill(0)
          .map((_, i) => ({
            id: `fallback-${i + 1}`,
            name: ["Sarah Johnson", "Michael Smith", "Emily Davis", "David Wilson"][i],
            title: ["Certified Notary Public", "Mobile Notary", "Certified Notary Public", "Notary Signing Agent"][i],
            location: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX"][i],
            rating: 5,
            reviews: [24, 18, 15, 32][i],
            services: [
              ["Loan Documents", "Real Estate", "Mobile Service"],
              ["Power of Attorney", "Affidavits", "Wills & Trusts"],
              ["Real Estate", "Loan Documents", "Acknowledgments"],
              ["Loan Signing", "Mobile Service", "Same-Day Available"],
            ][i],
            isVerified: true,
            isActive: true,
            profileImageUrl: defaultImages[i],
            phone: "",
            email: "",
            bio: "",
          })) as Notary[]

        setNotaries(mockData)
      } finally {
        setLoading(false)
      }
    }

    if (mounted) {
      fetchNotaries()
    }
  }, [mounted])

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || notaries.length === 0) return
      setIsTransitioning(true)
      setCurrentIndex(index)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1000) // Match this with the CSS transition duration
    },
    [isTransitioning, notaries.length],
  )

  const goToNextSlide = useCallback(() => {
    if (notaries.length === 0) return
    const nextIndex = (currentIndex + 1) % notaries.length
    goToSlide(nextIndex)
  }, [currentIndex, goToSlide, notaries.length])

  const goToPrevSlide = useCallback(() => {
    if (notaries.length === 0) return
    const prevIndex = (currentIndex - 1 + notaries.length) % notaries.length
    goToSlide(prevIndex)
  }, [currentIndex, goToSlide, notaries.length])

  // Autoplay
  useEffect(() => {
    if (autoplayPaused || notaries.length === 0) return

    const interval = setInterval(() => {
      goToNextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [goToNextSlide, autoplayPaused, notaries.length])

  const handleRetry = useCallback(() => {
    const fetchNotaries = async () => {
      try {
        console.log("Retrying active notary fetch...")
        setLoading(true)
        setError(null)
        const data = await getActiveNotaries(10)

        const dataWithImages = data.map((notary, index) => {
          if (!notary.profileImageUrl) {
            return {
              ...notary,
              profileImageUrl: defaultImages[index % defaultImages.length],
            }
          }
          return notary
        })

        console.log(`Fetched ${dataWithImages.length} active notaries on retry`)
        setNotaries(dataWithImages)
      } catch (error: any) {
        console.error("Failed to fetch active notaries on retry", error)
        setError("Failed to load notaries. Using sample data.")
      } finally {
        setLoading(false)
      }
    }

    fetchNotaries()
  }, [])

  if (!mounted) {
    return (
      <div className={`${heroMode ? "h-[400px]" : "h-[600px]"} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`${heroMode ? "h-[400px]" : "h-[600px]"} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading notaries...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`${heroMode ? "h-[400px]" : "h-[600px]"} flex flex-col items-center justify-center`}>
        <p className="text-amber-600 mb-4 text-center max-w-md">{error}</p>
        <Button onClick={handleRetry} className="bg-amber-700 hover:bg-amber-800">
          Retry Loading
        </Button>
      </div>
    )
  }

  if (notaries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No active notaries available at this time.</p>
          <Button onClick={handleRetry} className="bg-amber-700 hover:bg-amber-800">
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  if (heroMode) {
    return (
      <ClientOnly>
        <div className="relative overflow-hidden rounded-lg shadow-lg">
          {/* Data source indicator */}
          <div className="absolute top-2 left-2 z-20 bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs">
            Sample Data
          </div>

          {/* Particle Background */}
          <div className="relative h-[400px] bg-gradient-to-b from-blue-900 to-blue-800 rounded-xl overflow-hidden">
            {/* Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    backgroundColor: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"][i % 5],
                    width: `${Math.random() * 4 + 2}px`,
                    height: `${Math.random() * 4 + 2}px`,
                    top: `${Math.random() * 100}%`,
                    left: `${Math.random() * 100}%`,
                    opacity: 0.6,
                    animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                    animationDelay: `${Math.random() * 5}s`,
                  }}
                />
              ))}
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex-1 flex items-center justify-center p-4">
                <div
                  className="perspective-1000 w-full max-w-md mx-auto"
                  onMouseEnter={() => setAutoplayPaused(true)}
                  onMouseLeave={() => setAutoplayPaused(false)}
                >
                  <div className="relative h-[300px] transform-style-3d">
                    {notaries.map((notary, index) => (
                      <div
                        key={notary.id}
                        className={`absolute inset-0 w-full h-full backface-hidden transition-transform duration-1000 ease-in-out ${
                          index === currentIndex ? "z-10 rotate-y-0" : "rotate-y-90 opacity-0"
                        }`}
                        style={{
                          transform: `rotateY(${index === currentIndex ? 0 : 90}deg)`,
                          opacity: index === currentIndex ? 1 : 0,
                          transition: "transform 1s ease-in-out, opacity 0.5s ease-in-out",
                        }}
                      >
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden h-full flex flex-col">
                          <div className="relative w-full h-40">
                            <Image
                              src={notary.profileImageUrl || defaultImages[index % defaultImages.length]}
                              alt={notary.name}
                              fill
                              className="object-cover"
                              sizes="100vw"
                            />
                            <div className="absolute top-2 right-2">
                              <PriceBadge size="sm" />
                            </div>
                          </div>
                          <div className="p-4 flex-1 flex flex-col">
                            <div className="flex items-center mb-1">
                              <h3 className="text-lg font-bold mr-1">{notary.name}</h3>
                              {notary.isVerified && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                            </div>
                            <p className="text-gray-600 text-sm mb-1">{notary.title}</p>
                            <div className="flex items-center text-gray-600 text-sm mb-2">
                              <MapPin className="h-3 w-3 mr-1" />
                              <span>{notary.location}</span>
                            </div>
                            <div className="flex items-center mb-2">
                              {Array(notary.rating)
                                .fill(0)
                                .map((_, i) => (
                                  <Star key={i} className="h-4 w-4 text-amber-500 fill-current" />
                                ))}
                              <span className="ml-1 text-gray-600 text-xs">({notary.reviews})</span>
                            </div>
                            <div className="mt-auto">
                              <Button asChild size="sm" className="w-full bg-amber-700 hover:bg-amber-800 text-sm">
                                <Link href={`/notary/${notary.id}`}>View Profile</Link>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-2 flex justify-between items-center">
                <button
                  onClick={goToPrevSlide}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
                  aria-label="Previous slide"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <div className="flex space-x-1">
                  {notaries.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentIndex ? "bg-amber-500" : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={goToNextSlide}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors"
                  aria-label="Next slide"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <style jsx global>{`
          @keyframes float {
            0% {
              transform: translateY(0) translateX(0);
            }
            25% {
              transform: translateY(-20px) translateX(10px);
            }
            50% {
              transform: translateY(0) translateX(20px);
            }
            75% {
              transform: translateY(20px) translateX(10px);
            }
            100% {
              transform: translateY(0) translateX(0);
            }
          }

          .perspective-1000 {
            perspective: 1000px;
          }

          .transform-style-3d {
            transform-style: preserve-3d;
          }

          .backface-hidden {
            backface-visibility: hidden;
          }

          .rotate-y-0 {
            transform: rotateY(0deg);
          }

          .rotate-y-90 {
            transform: rotateY(90deg);
          }
        `}</style>
      </ClientOnly>
    )
  }

  return (
    <ClientOnly>
      <div className="relative overflow-hidden">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Notaries</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Browse our selection of professional notaries ready to assist you with your document needs.
          </p>
          <p className="text-amber-600 text-sm mt-2">
            Note: Sample data is being displayed. Update Firebase rules to see real notary data.
          </p>
        </div>

        {/* Particle Background */}
        <div className="relative h-[600px] bg-gradient-to-b from-blue-900 to-blue-800 rounded-xl overflow-hidden">
          {/* Particles */}
          <div className="absolute inset-0 overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  backgroundColor: ["#f59e0b", "#10b981", "#3b82f6", "#ef4444", "#8b5cf6"][i % 5],
                  width: `${Math.random() * 6 + 2}px`,
                  height: `${Math.random() * 6 + 2}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.6,
                  animation: `float ${Math.random() * 10 + 10}s linear infinite`,
                  animationDelay: `${Math.random() * 5}s`,
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center p-6">
              <div
                className="perspective-1000 w-full max-w-4xl mx-auto"
                onMouseEnter={() => setAutoplayPaused(true)}
                onMouseLeave={() => setAutoplayPaused(false)}
              >
                <div className="relative h-[400px] transform-style-3d">
                  {notaries.map((notary, index) => (
                    <div
                      key={notary.id}
                      className={`absolute inset-0 w-full h-full backface-hidden transition-transform duration-1000 ease-in-out ${
                        index === currentIndex ? "z-10 rotate-y-0" : "rotate-y-90 opacity-0"
                      }`}
                      style={{
                        transform: `rotateY(${index === currentIndex ? 0 : 90}deg)`,
                        opacity: index === currentIndex ? 1 : 0,
                        transition: "transform 1s ease-in-out, opacity 0.5s ease-in-out",
                      }}
                    >
                      <div className="bg-white rounded-xl shadow-2xl overflow-hidden h-full flex flex-col md:flex-row">
                        <div className="relative w-full md:w-1/2 h-48 md:h-auto">
                          <Image
                            src={notary.profileImageUrl || defaultImages[index % defaultImages.length]}
                            alt={notary.name}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                          <div className="absolute top-4 right-4">
                            <PriceBadge size="md" />
                          </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-center mb-2">
                            <h3 className="text-2xl font-bold mr-2">{notary.name}</h3>
                            {notary.isVerified && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                          </div>
                          <p className="text-gray-600 mb-2">{notary.title}</p>
                          <div className="flex items-center text-gray-600 mb-3">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{notary.location}</span>
                          </div>
                          <div className="flex items-center mb-4">
                            {Array(notary.rating)
                              .fill(0)
                              .map((_, i) => (
                                <Star key={i} className="h-5 w-5 text-amber-500 fill-current" />
                              ))}
                            <span className="ml-2 text-gray-600">({notary.reviews} reviews)</span>
                          </div>
                          <div className="mb-4">
                            <h4 className="font-medium mb-2">Services:</h4>
                            <div className="flex flex-wrap gap-2">
                              {notary.services.map((service, i) => (
                                <span key={i} className="bg-gray-100 px-3 py-1 rounded-full text-sm">
                                  {service}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="mt-auto">
                            <Button asChild className="w-full bg-amber-700 hover:bg-amber-800">
                              <Link href={`/notary/${notary.id}`}>View Profile</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="p-6 flex justify-between items-center">
              <button
                onClick={goToPrevSlide}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                aria-label="Previous slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex space-x-2">
                {notaries.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentIndex ? "bg-amber-500" : "bg-white/50 hover:bg-white/70"
                    }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goToNextSlide}
                className="bg-white/20 hover:bg-white/30 text-white rounded-full p-3 transition-colors"
                aria-label="Next slide"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
          }
          25% {
            transform: translateY(-20px) translateX(10px);
          }
          50% {
            transform: translateY(0) translateX(20px);
          }
          75% {
            transform: translateY(20px) translateX(10px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        .transform-style-3d {
          transform-style: preserve-3d;
        }

        .backface-hidden {
          backface-visibility: hidden;
        }

        .rotate-y-0 {
          transform: rotateY(0deg);
        }

        .rotate-y-90 {
          transform: rotateY(90deg);
        }
      `}</style>
    </ClientOnly>
  )
}
