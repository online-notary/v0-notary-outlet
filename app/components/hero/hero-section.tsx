"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import dynamic from "next/dynamic"

// Dynamically import the EnhancedCubeSlider with no SSR
const EnhancedCubeSlider = dynamic(() => import("./enhanced-cube-slider"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
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
  ),
})

export default function HeroSection() {
  return (
    <section className="bg-amber-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="order-2 lg:order-1">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Find Notaries Near You</h1>
            <p className="text-lg text-gray-700 mb-8">
              Connect with verified notaries in your area for fast, reliable service at a flat rate of $5 per signature.
            </p>
            <Link href="/notaries" passHref>
              <Button className="bg-amber-700 hover:bg-amber-800 text-white px-8 py-6 text-lg">Find a Notary</Button>
            </Link>
          </div>
          <div className="order-1 lg:order-2 h-[400px] w-full">
            <EnhancedCubeSlider />
          </div>
        </div>
      </div>
    </section>
  )
}
