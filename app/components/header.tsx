"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"
import { PriceBadge } from "./price-badge"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-amber-700">
              NotaryOutlet
            </Link>
            <div className="hidden md:flex space-x-6">
              {/* Placeholder for nav items */}
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      {/* Announcement Bar */}
      <div className="bg-amber-700 text-white py-2 px-4">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-center sm:justify-between">
          <span className="text-sm font-medium mb-2 sm:mb-0">All notaries nationwide - No hidden fees!</span>
          <PriceBadge size="sm" className="transform hover:scale-105 transition-transform" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="text-2xl font-bold text-amber-700">
              NotaryOutlet
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/#how-it-works" className="text-gray-600 hover:text-amber-700">
              How It Works
            </Link>
            <Link href="/notaries" className="text-gray-600 hover:text-amber-700">
              Find a Notary
            </Link>
            <Link href="/#testimonials" className="text-gray-600 hover:text-amber-700">
              Testimonials
            </Link>
            <Link href="/#faq" className="text-gray-600 hover:text-amber-700">
              FAQ
            </Link>
            <div className="flex items-center space-x-3">
              <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-50" asChild>
                <Link href="/notary/login">Notary Login</Link>
              </Button>
              <Button className="bg-amber-700 hover:bg-amber-800">Book Now</Button>
            </div>
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/#how-it-works"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                How It Works
              </Link>
              <Link
                href="/notaries"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Notary
              </Link>
              <Link
                href="/#testimonials"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Testimonials
              </Link>
              <Link
                href="/#faq"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/notary/login"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Notary Login
              </Link>
              <Link href="/notaries" passHref onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-amber-700 hover:bg-amber-800 w-full">Book Now</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
