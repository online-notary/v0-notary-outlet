"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "./components/header"
import HeroSection from "./components/hero/hero-section"
import { ArrowRight, Award, Clock, MapPin, Shield, Users } from "lucide-react"
import Link from "next/link"
import AnimatedTravelBackground from "./components/travel/animated-travel-background"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Why Choose Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose NotaryOutlet?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Affordable Pricing</h3>
              <p className="text-gray-600">Flat rate of $5 per signature with no hidden fees or surprises.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Verified Notaries</h3>
              <p className="text-gray-600">All notaries are verified and background-checked for your peace of mind.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Convenient Service</h3>
              <p className="text-gray-600">Many of our notaries offer mobile services and can come to your location.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Traveling Soon Section */}
      <section className="py-16 relative">
        <AnimatedTravelBackground />
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col lg:flex-row gap-8 items-center">
            <div className="w-full lg:w-1/2 bg-white bg-opacity-80 p-6 rounded-lg shadow-md">
              <h2 className="text-3xl font-bold mb-4">Traveling Soon? We've Got You Covered</h2>
              <p className="text-lg text-gray-700 mb-4">
                We help clients with apostilles and notarized documents for international use. While you're preparing to
                travel, make sure you're protected abroad with reliable travel health insurance.
              </p>
              <p className="text-lg font-medium text-gray-800 mb-6">Compare plans below in seconds.</p>
              <div className="block lg:hidden">
                <Button
                  className="bg-amber-700 hover:bg-amber-800 text-white"
                  onClick={() => {
                    const iframe = document.getElementById("travel-insurance-iframe")
                    if (iframe) {
                      iframe.scrollIntoView({ behavior: "smooth" })
                    }
                  }}
                >
                  Compare Plans
                </Button>
              </div>
            </div>
            <div className="w-full lg:w-1/2">
              <div className="bg-white p-2 rounded-lg shadow-md">
                <iframe
                  id="travel-insurance-iframe"
                  width="100%"
                  height="500"
                  frameBorder="0"
                  allowTransparency={true}
                  title="Travel Health Insurance Comparison"
                  src="https://overseascoverage.brokersnexus.com/widget3/travel-health-insurance/"
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Card Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Our Notary Services</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            We offer a wide range of notary services to meet your needs, whether you're buying a home, starting a
            business, or traveling abroad.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Card 1 */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>Mobile Notary</CardTitle>
                  <MapPin className="h-6 w-6" />
                </div>
                <CardDescription className="text-amber-100">We come to your location</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Our mobile notaries will travel to your home, office, or any location convenient for you. Perfect for
                  busy professionals, elderly clients, or anyone who prefers the convenience of at-home service.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-amber-700 font-semibold">Starting at $5/signature</p>
                <Link href="/notaries" passHref>
                  <Button variant="outline" className="group">
                    Book Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Card 2 */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-800 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>Loan Signing</CardTitle>
                  <Users className="h-6 w-6" />
                </div>
                <CardDescription className="text-amber-100">Expert real estate document handling</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Our specialized loan signing agents are experienced with real estate transactions and can guide you
                  through the signing process. We ensure all documents are properly executed for your closing.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-amber-700 font-semibold">Flat rate packages available</p>
                <Link href="/notaries" passHref>
                  <Button variant="outline" className="group">
                    Learn More
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Card 3 */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-700 to-amber-900 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>Apostille Services</CardTitle>
                  <Award className="h-6 w-6" />
                </div>
                <CardDescription className="text-amber-100">International document authentication</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Need documents for international use? We can help with the apostille process, ensuring your documents
                  are properly authenticated for use in foreign countries that are members of the Hague Convention.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-amber-700 font-semibold">Professional handling</p>
                <Link href="/notaries" passHref>
                  <Button variant="outline" className="group">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Additional Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            {/* Card 4 */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-600 to-amber-800 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>Same-Day Service</CardTitle>
                  <Clock className="h-6 w-6" />
                </div>
                <CardDescription className="text-amber-100">Quick turnaround when you need it most</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Need notary services urgently? Many of our notaries offer same-day appointments, even on evenings and
                  weekends. We understand that some documents can't wait.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-amber-700 font-semibold">Available 7 days a week</p>
                <Link href="/notaries" passHref>
                  <Button variant="outline" className="group">
                    Find Availability
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>

            {/* Card 5 */}
            <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl">
              <CardHeader className="bg-gradient-to-r from-amber-500 to-amber-700 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle>Secure Notarization</CardTitle>
                  <Shield className="h-6 w-6" />
                </div>
                <CardDescription className="text-amber-100">Protection against fraud and errors</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="text-gray-600">
                  Our notaries follow strict protocols to verify identity and ensure document integrity. We maintain
                  detailed records of all notarizations to provide you with peace of mind and legal protection.
                </p>
              </CardContent>
              <CardFooter className="flex justify-between items-center">
                <p className="text-amber-700 font-semibold">Verified professionals</p>
                <Link href="/notaries" passHref>
                  <Button variant="outline" className="group">
                    Learn About Our Process
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
