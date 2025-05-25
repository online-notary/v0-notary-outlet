"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  MapPin,
  Search,
  Star,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Filter,
  AlertTriangle,
  XCircle,
  RefreshCw,
} from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ClientOnly } from "../components/client-only"
import Header from "../components/header"
import { PriceBadge } from "../components/price-badge"
import { getAllNotaries, type Notary } from "../data/notaries"

// Function to extract states from notaries
const extractStates = (notaries: Notary[]) => {
  const states = new Set<string>()
  notaries.forEach((notary) => {
    const location = notary.location.split(", ")
    if (location.length > 1) {
      states.add(location[1])
    }
  })
  return Array.from(states).sort()
}

// Function to extract services from notaries
const extractServices = (notaries: Notary[]) => {
  const services = new Set<string>()
  notaries.forEach((notary) => {
    notary.services.forEach((service: string) => {
      services.add(service)
    })
  })
  return Array.from(services).sort()
}

// Notary page skeleton component
function NotariesPageSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-2">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
              <h1 className="text-3xl font-bold">All Notaries</h1>
            </div>
            <div className="w-24 h-10 bg-gray-200 rounded animate-pulse"></div>
          </div>

          {/* Search Bar Skeleton */}
          <div className="mb-6">
            <div className="h-14 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>

          {/* Results Stats Skeleton */}
          <div className="mb-4 h-5 w-48 bg-gray-200 rounded animate-pulse"></div>

          {/* Notary Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array(9)
              .fill(0)
              .map((_, index) => (
                <Card key={index} className="overflow-hidden h-full">
                  <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-6 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse mb-3"></div>
                    <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function NotariesPage() {
  const [allNotaries, setAllNotaries] = useState<Notary[]>([])
  const [filteredNotaries, setFilteredNotaries] = useState<Notary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usedMockData, setUsedMockData] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false)
  const [selectedState, setSelectedState] = useState<string>("all")
  const [selectedService, setSelectedService] = useState<string>("all")
  const [showFilters, setShowFilters] = useState(false)

  const notariesPerPage = 9

  // Fetch notaries from Firebase
  const fetchNotaries = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching notaries from Firebase...")

      const result = await getAllNotaries(200) // Get more notaries for better filtering
      console.log("Fetch result:", result)

      // Filter for active notaries only
      const activeNotaries = result.notaries.filter((notary) => notary.isActive === true)
      console.log(`Filtered to ${activeNotaries.length} active notaries out of ${result.notaries.length} total`)

      setAllNotaries(activeNotaries)
      setUsedMockData(result.usedMockData)

      if (activeNotaries.length === 0) {
        setError("No active notaries found in the database.")
      }
    } catch (err) {
      console.error("Error fetching notaries:", err)
      setError("Failed to load notaries. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Initial data fetch
  useEffect(() => {
    fetchNotaries()
  }, [])

  // Extract states and services from current notaries
  const states = extractStates(allNotaries)
  const services = extractServices(allNotaries)

  useEffect(() => {
    // Apply filters whenever filter criteria change
    let result = [...allNotaries]

    // Filter by verification status
    if (showVerifiedOnly) {
      result = result.filter((notary) => notary.isVerified)
    }

    // Filter by state
    if (selectedState !== "all") {
      result = result.filter((notary) => {
        const location = notary.location.split(", ")
        const state = location.length > 1 ? location[1] : location[0]
        return state === selectedState
      })
    }

    // Filter by service
    if (selectedService !== "all") {
      result = result.filter((notary) => notary.services.includes(selectedService))
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (notary) =>
          notary.name.toLowerCase().includes(query) ||
          notary.location.toLowerCase().includes(query) ||
          notary.services.some((service) => service.toLowerCase().includes(query)),
      )
    }

    setFilteredNotaries(result)
    setCurrentPage(1) // Reset to first page when filters change
  }, [allNotaries, showVerifiedOnly, selectedState, selectedService, searchQuery])

  // Calculate pagination
  const totalPages = Math.ceil(filteredNotaries.length / notariesPerPage)
  const indexOfLastNotary = currentPage * notariesPerPage
  const indexOfFirstNotary = indexOfLastNotary - notariesPerPage
  const currentNotaries = filteredNotaries.slice(indexOfFirstNotary, indexOfLastNotary)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search is already handled by the useEffect
  }

  const handleClearFilters = () => {
    setSearchQuery("")
    setShowVerifiedOnly(false)
    setSelectedState("all")
    setSelectedService("all")
  }

  const handleRetry = () => {
    fetchNotaries()
  }

  if (loading) {
    return <NotariesPageSkeleton />
  }

  return (
    <ClientOnly fallback={<NotariesPageSkeleton />}>
      <div className="flex flex-col min-h-screen">
        <Header />

        <main className="flex-1 bg-gray-50 py-8">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-2">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
                <h1 className="text-3xl font-bold">All Notaries</h1>
                {/* Data source indicator */}
                <div className="mt-2">
                  {usedMockData ? (
                    <Badge variant="outline" className="text-amber-600 border-amber-200">
                      Sample Data - Update Firebase rules to see real data
                    </Badge>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      ✓ Displaying real notary data from Firebase
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                  {(showVerifiedOnly || selectedState !== "all" || selectedService !== "all") && (
                    <Badge className="ml-1 bg-amber-700">Active</Badge>
                  )}
                </Button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-red-700">{error}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleRetry}>
                    Try Again
                  </Button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Panel */}
              {showFilters && (
                <div className="lg:col-span-1">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="font-semibold text-lg">Filters</h2>
                        <Button variant="ghost" size="sm" onClick={handleClearFilters} className="h-8 text-xs">
                          Clear All
                        </Button>
                      </div>

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="verified-only"
                              checked={showVerifiedOnly}
                              onCheckedChange={(checked) => setShowVerifiedOnly(!!checked)}
                            />
                            <Label htmlFor="verified-only" className="text-sm font-medium">
                              Verified Notaries Only
                            </Label>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state-filter" className="text-sm font-medium">
                            State
                          </Label>
                          <Select value={selectedState} onValueChange={setSelectedState}>
                            <SelectTrigger id="state-filter">
                              <SelectValue placeholder="Select a state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All States</SelectItem>
                              {states.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="service-filter" className="text-sm font-medium">
                            Service
                          </Label>
                          <Select value={selectedService} onValueChange={setSelectedService}>
                            <SelectTrigger id="service-filter">
                              <SelectValue placeholder="Select a service" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Services</SelectItem>
                              {services.map((service) => (
                                <SelectItem key={service} value={service}>
                                  {service}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Main Content */}
              <div className={showFilters ? "lg:col-span-3" : "lg:col-span-4"}>
                {/* Search Bar */}
                <form onSubmit={handleSearch} className="mb-6">
                  <div className="relative">
                    <Input
                      placeholder="Search by name, location, or service..."
                      className="pl-10 pr-4 py-6 text-lg rounded-lg shadow-sm"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    {searchQuery && (
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                        onClick={() => setSearchQuery("")}
                      >
                        <XCircle className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </form>

                {/* Results Stats */}
                <div className="mb-4 text-sm text-gray-500">
                  Showing {currentNotaries.length} of {filteredNotaries.length} active notaries
                  {showVerifiedOnly && " (verified only)"}
                  {selectedState !== "all" && ` in ${selectedState}`}
                  {selectedService !== "all" && ` offering ${selectedService}`}
                </div>

                {/* Notary Grid */}
                {currentNotaries.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {currentNotaries.map((notary) => (
                      <Link
                        href={`/notary/${notary.id}`}
                        key={notary.id}
                        className="block h-full transition-all duration-300 hover:shadow-lg"
                      >
                        <Card className="overflow-hidden h-full">
                          <div className="relative h-48 w-full bg-gray-100">
                            <Image
                              src={
                                notary.profileImageUrl ||
                                `/placeholder.svg?height=300&width=500&query=professional notary ${notary.name || "/placeholder.svg"}`
                              }
                              alt={notary.name}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                            <div className="absolute top-2 right-2">
                              <PriceBadge size="sm" className="transform hover:scale-105 transition-transform" />
                            </div>
                          </div>
                          <CardContent className="p-4">
                            <div className="flex items-center mb-1">
                              <h3 className="font-semibold text-lg mr-2">{notary.name}</h3>
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

                            {notary.isVerified ? (
                              <div className="flex items-center text-sm text-green-600 mb-3">
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                <span>Verified Notary</span>
                              </div>
                            ) : (
                              <div className="flex items-center text-sm text-gray-400 mb-3">
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                <span>Pending Verification</span>
                              </div>
                            )}

                            <div className="mb-3">
                              <h4 className="text-sm font-medium mb-1">Services:</h4>
                              <div className="flex flex-wrap gap-1">
                                {notary.services.slice(0, 3).map((service, index) => (
                                  <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                    {service}
                                  </span>
                                ))}
                                {notary.services.length > 3 && (
                                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                    +{notary.services.length - 3} more
                                  </span>
                                )}
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full border-amber-700 text-amber-700 hover:bg-amber-50 mt-2"
                            >
                              View Profile
                            </Button>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-lg shadow">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <AlertTriangle className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No notaries found</h3>
                    <p className="text-gray-500 mb-6">
                      {allNotaries.length === 0
                        ? "No active notaries are available in the database."
                        : "No notaries match your search criteria. Try adjusting your filters."}
                    </p>
                    <div className="flex justify-center gap-2">
                      {allNotaries.length === 0 ? (
                        <Button onClick={handleRetry} className="bg-amber-700 hover:bg-amber-800">
                          Refresh Data
                        </Button>
                      ) : (
                        <Button onClick={handleClearFilters} className="bg-amber-700 hover:bg-amber-800">
                          Clear All Filters
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2 mt-8">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous
                    </Button>

                    <div className="text-sm">
                      Page {currentPage} of {totalPages}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-white text-lg font-semibold mb-4">NotaryOutlet</h3>
                <p className="mb-4">Professional $5 notary services nationwide.</p>
                <div className="flex items-center">
                  <PriceBadge size="sm" className="mr-2" />
                  <span>Flat rate guarantee</span>
                </div>
              </div>

              <div>
                <h3 className="text-white text-lg font-semibold mb-4">Services</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/#find-notary" className="hover:text-amber-500">
                      Find a Notary
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Mobile Notary
                    </Link>
                  </li>
                  <li>
                    <Link href="/notary/register" className="hover:text-amber-500">
                      Become a Notary
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Business Services
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white text-lg font-semibold mb-4">Company</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      About Us
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Press
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-white text-lg font-semibold mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-amber-500">
                      Cookie Policy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
              <p>&copy; {new Date().getFullYear()} NotaryOutlet. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </ClientOnly>
  )
}
