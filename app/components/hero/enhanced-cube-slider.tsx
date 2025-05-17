"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Swiper, SwiperSlide } from "swiper/react"
import { EffectCube, Pagination, Navigation, Autoplay } from "swiper/modules"
import { Star } from "lucide-react"

// Import Swiper styles
import "swiper/css"
import "swiper/css/effect-cube"
import "swiper/css/pagination"
import "swiper/css/navigation"

// Static slider data to avoid Firebase dependency
const staticSliderData = [
  {
    id: "1",
    title: "Mobile Notary Services",
    description: "We come to you! Our mobile notaries travel to your location for convenient service.",
    imageUrl: "/mobile-notary.png",
    rating: 4.8,
    reviews: 124,
    price: "$5 per signature",
  },
  {
    id: "2",
    title: "Document Signing",
    description: "Fast and reliable document signing services for all your legal needs.",
    imageUrl: "/notary-signing.png",
    rating: 4.9,
    reviews: 98,
    price: "$5 per signature",
  },
  {
    id: "3",
    title: "Legal Document Services",
    description: "Professional notarization for all your important legal documents.",
    imageUrl: "/legal-document-signing.png",
    rating: 4.7,
    reviews: 156,
    price: "$5 per signature",
  },
]

export default function EnhancedCubeSlider() {
  const [mounted, setMounted] = useState(false)
  const [sliderData, setSliderData] = useState(staticSliderData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      setMounted(true)
    } catch (err) {
      console.error("Error in slider component:", err)
      setError("Failed to initialize slider")
    }
  }, [])

  // If not mounted yet, return a loading placeholder
  if (!mounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="animate-pulse flex space-x-4">
          <div className="rounded-full bg-gray-300 h-12 w-12"></div>
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // If there's an error, show error message
  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-500 mb-2">Something went wrong</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    )
  }

  // If no slider data, show a message
  if (!sliderData || sliderData.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center p-4">
          <p className="text-gray-500">No slider content available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-full">
      <Swiper
        effect={"cube"}
        grabCursor={true}
        cubeEffect={{
          shadow: true,
          slideShadows: true,
          shadowOffset: 20,
          shadowScale: 0.94,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        modules={[EffectCube, Pagination, Navigation, Autoplay]}
        className="w-full h-full"
      >
        {sliderData.map((slide) => (
          <SwiperSlide key={slide.id}>
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src={slide.imageUrl || "/placeholder.svg?height=500&width=500&query=notary"}
                alt={slide.title}
                width={500}
                height={500}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xl font-bold">{slide.title}</h3>
                  <span className="bg-amber-600/90 text-white text-sm px-3 py-1 rounded-full">{slide.price}</span>
                </div>
                <p className="text-sm mb-3">{slide.description}</p>
                <div className="flex items-center">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(slide.rating) ? "fill-amber-400 text-amber-400" : "text-gray-400"}
                      />
                    ))}
                  </div>
                  <span className="ml-2 text-sm">
                    {slide.rating} ({slide.reviews} reviews)
                  </span>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}
