"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

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
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-amber-700">
            NotaryOutlet
          </Link>

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
            <Link href="/notaries" className="text-gray-600 hover:text-amber-700">
              Find a Notary
            </Link>
            <Link href="/about" className="text-gray-600 hover:text-amber-700">
              About Us
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-amber-700">
              Contact
            </Link>
            <Link href="/notary/login" className="text-gray-600 hover:text-amber-700">
              Notary Login
            </Link>
            <Link href="/notary/register" passHref>
              <Button className="bg-amber-700 hover:bg-amber-800">Register as Notary</Button>
            </Link>
          </nav>
        </div>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/notaries"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Find a Notary
              </Link>
              <Link
                href="/about"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                About Us
              </Link>
              <Link
                href="/contact"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Link
                href="/notary/login"
                className="text-gray-600 hover:text-amber-700 py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Notary Login
              </Link>
              <Link href="/notary/register" passHref onClick={() => setIsMenuOpen(false)}>
                <Button className="bg-amber-700 hover:bg-amber-800 w-full">Register as Notary</Button>
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
