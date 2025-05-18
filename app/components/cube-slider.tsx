"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { CheckCircle2, MapPin, Star } from "lucide-react"
import { PriceBadge } from "./price-badge"
import { ClientOnly } from "./client-only"

// Mock notary data
const notaries = [
  {
    id: "1",
    name: "Sarah Johnson",
    title: "Certified Notary Public",
    location: "New York, NY",
    rating: 5,
    reviews: 24,
    services: ["Loan Documents", "Real Estate", "Mobile Service"],
    isVerified: true,
    image: "/female-notary-office.png",
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
    image: "/notary-signing-documents.png",
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
    image: "/female-notary-client.png",
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
    image: "/notary-signing.png",
  },
]

interface CubeSliderProps {
  heroMode?: boolean
}

export default function CubeSlider({ heroMode = false }: CubeSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [autoplayPaused, setAutoplayPaused] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning) return
      setIsTransitioning(true)
      setCurrentIndex(index)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1000) // Match this with the CSS transition duration
    },
    [isTransitioning],
  )

  const goToNextSlide = useCallback(() => {
    const nextIndex = (currentIndex + 1) % notaries.length
    goToSlide(nextIndex)
  }, [currentIndex, goToSlide, notaries.length])

  const goToPrevSlide = useCallback(() => {
    const prevIndex = (currentIndex - 1 + notaries.length) % notaries.length
    goToSlide(prevIndex)
  }, [currentIndex, goToSlide, notaries.length])

  // Autoplay
  useEffect(() => {
    if (autoplayPaused) return

    const interval = setInterval(() => {
      goToNextSlide()
    }, 5000)

    return () => clearInterval(interval)
  }, [goToNextSlide, autoplayPaused])

  if (!mounted) {
    return (
      <div className={`${heroMode ? "h-[400px]" : "h-[600px]"} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
      </div>
    )
  }

  if (heroMode) {
    return (
      <ClientOnly>
        <div className="relative overflow-hidden rounded-lg shadow-lg">
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
                              src={notary.image || "/placeholder.svg"}
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
            Browse our selection of verified notaries ready to assist you with your document needs.
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
                            src={notary.image || "/placeholder.svg"}
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
