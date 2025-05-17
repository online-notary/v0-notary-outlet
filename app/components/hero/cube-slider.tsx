"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { collection, getDocs, query } from "firebase/firestore"
import { db } from "@/app/lib/firebase"

interface SliderImage {
  id: string
  imageUrl: string
  title: string
  order: number
}

export function CubeSlider() {
  const [slides, setSlides] = useState<SliderImage[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const autoplayRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch slider images from Firestore
  useEffect(() => {
    async function fetchSliderImages() {
      try {
        setLoading(true)
        const sliderCollection = collection(db, "sliderImages")
        const sliderQuery = query(sliderCollection) // Get all slider images without filters
        const querySnapshot = await getDocs(sliderQuery)

        const imageList: SliderImage[] = []
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          // Only add active images to the list
          if (data.isActive !== false) {
            imageList.push({
              id: doc.id,
              imageUrl: data.imageUrl || "",
              title: data.title || "",
              order: data.order || 0,
            })
          }
        })

        // Sort by order in memory
        imageList.sort((a, b) => a.order - b.order)

        // If no images found, use placeholders
        if (imageList.length === 0) {
          const placeholders = [
            {
              id: "placeholder1",
              imageUrl: "/notary-signing.png",
              title: "Professional Notary Services",
              order: 1,
            },
            {
              id: "placeholder2",
              imageUrl: "/mobile-notary.png",
              title: "Mobile Notary Available",
              order: 2,
            },
            {
              id: "placeholder3",
              imageUrl: "/legal-document-signing.png",
              title: "Fast Document Processing",
              order: 3,
            },
          ]
          setSlides(placeholders)
        } else {
          setSlides(imageList)
        }
      } catch (err) {
        console.error("Error fetching slider images:", err)
        setError("Failed to load slider images")

        // Use placeholders on error
        const placeholders = [
          {
            id: "placeholder1",
            imageUrl: "/notary-signing.png",
            title: "Professional Notary Services",
            order: 1,
          },
          {
            id: "placeholder2",
            imageUrl: "/mobile-notary.png",
            title: "Mobile Notary Available",
            order: 2,
          },
          {
            id: "placeholder3",
            imageUrl: "/legal-document-signing.png",
            title: "Fast Document Processing",
            order: 3,
          },
        ]
        setSlides(placeholders)
      } finally {
        setLoading(false)
      }
    }

    fetchSliderImages()
  }, [])

  // Set up autoplay
  useEffect(() => {
    if (slides.length <= 1) return

    const startAutoplay = () => {
      autoplayRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
      }, 5000) // Change slide every 5 seconds
    }

    startAutoplay()

    // Pause autoplay when user interacts with slider
    const container = containerRef.current
    const pauseAutoplay = () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
    }

    const resumeAutoplay = () => {
      pauseAutoplay()
      startAutoplay()
    }

    container?.addEventListener("mouseenter", pauseAutoplay)
    container?.addEventListener("mouseleave", resumeAutoplay)

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current)
      }
      container?.removeEventListener("mouseenter", pauseAutoplay)
      container?.removeEventListener("mouseleave", resumeAutoplay)
    }
  }, [slides.length])

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? slides.length - 1 : prevIndex - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length)
  }

  if (loading) {
    return (
      <div className="relative w-full h-[400px] bg-amber-50 rounded-lg overflow-hidden flex items-center justify-center">
        <div className="animate-pulse bg-amber-100 w-full h-full"></div>
      </div>
    )
  }

  if (error && slides.length === 0) {
    return (
      <div className="relative w-full h-[400px] bg-amber-50 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-amber-800">Unable to load slider images</p>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="relative w-full h-[400px] perspective-1000 group">
      <div
        className="w-full h-full transform-style-3d transition-transform duration-700 ease-in-out"
        style={{
          transform: `rotateY(${-90 * currentIndex}deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className="absolute w-full h-full backface-visibility-hidden"
            style={{
              transform: `rotateY(${90 * index}deg) translateZ(200px)`,
              backfaceVisibility: "hidden",
            }}
          >
            <div className="relative w-full h-full rounded-lg overflow-hidden shadow-lg">
              <Image
                src={slide.imageUrl || "/placeholder.svg"}
                alt={slide.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <h3 className="text-white text-lg font-semibold">{slide.title}</h3>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-amber-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-amber-800 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
        aria-label="Next slide"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${currentIndex === index ? "bg-white" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
