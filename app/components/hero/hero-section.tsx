"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import CubeSlider from "../cube-slider"

export default function HeroSection() {
  const router = useRouter()
  const [location, setLocation] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.trim()) {
      router.push(`/notaries?location=${encodeURIComponent(location)}`)
    } else {
      router.push("/notaries")
    }
  }

  return (
    <section className="bg-amber-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find Notaries Near You</h1>
            <p className="text-lg text-gray-700 mb-8">
              Connect with verified notaries in your area for fast, reliable service at a flat rate of $5 per signature.
            </p>

            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your location"
                    className="pl-10 py-6 text-lg rounded-lg"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
                <Button type="submit" className="bg-amber-700 hover:bg-amber-800 py-6 text-lg">
                  <Search className="mr-2 h-5 w-5" />
                  Find Notaries
                </Button>
              </div>
            </form>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-2">
                  <span className="text-green-600 font-bold">$5</span>
                </div>
                <span className="text-gray-700">Flat Rate</span>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Verified Notaries</span>
              </div>

              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-amber-600"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-gray-700">Same-Day Available</span>
              </div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative">
              <CubeSlider heroMode={true} />
              <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="bg-green-600 text-white rounded-full w-10 h-10 flex items-center justify-center mr-3 font-bold">
                    $5
                  </div>
                  <div>
                    <div className="font-semibold">Flat Rate</div>
                    <div className="text-sm text-gray-500">Per Signature</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
