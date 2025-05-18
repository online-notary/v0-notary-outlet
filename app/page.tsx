"use client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "./components/header"
import HeroSection from "./components/hero/hero-section"
import { ArrowRight, Award, Clock, MapPin, Shield, Users } from "lucide-react"
import Link from "next/link"
import { PriceFeature } from "./components/price-feature"
import { Footer } from "./components/footer"

export default function Home() {
  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section with Cube Slider */}
      <HeroSection />

      {/* Pricing Feature Section */}
      <PriceFeature />

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

      {/* How It Works Section */}
      <section className="py-16 bg-gray-50" id="how-it-works">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Getting your documents notarized is easy with NotaryOutlet
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-700 font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Find a Notary</h3>
              <p className="text-gray-600">
                Search for verified notaries in your area based on location and availability.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-700 font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Book an Appointment</h3>
              <p className="text-gray-600">
                Schedule a convenient time for your notarization, either at your location or theirs.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md text-center">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-amber-700 font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Get Notarized</h3>
              <p className="text-gray-600">
                Meet with your notary, have your documents notarized, and pay the flat $5 fee per signature.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
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

      {/* Testimonials Section */}
      <section className="py-16 bg-gray-50" id="testimonials">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">What Our Clients Say</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Don't just take our word for it. Here's what our satisfied clients have to say about our notary services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "The notary was prompt, professional, and made the process incredibly easy. I needed documents notarized
                for a real estate closing, and everything went smoothly."
              </p>
              <div className="font-semibold">- Sarah Johnson</div>
              <div className="text-sm text-gray-500">Real Estate Transaction</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "I needed a mobile notary for my elderly mother who couldn't leave her home. The notary was kind,
                patient, and explained everything clearly. The $5 flat rate was a great value!"
              </p>
              <div className="font-semibold">- Michael Rodriguez</div>
              <div className="text-sm text-gray-500">Power of Attorney</div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-600 mb-4">
                "I had an urgent document that needed notarization on a Sunday. NotaryOutlet found me a notary within an
                hour! Incredible service when I really needed it."
              </p>
              <div className="font-semibold">- Jennifer Lee</div>
              <div className="text-sm text-gray-500">Urgent Business Documents</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16" id="faq">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Frequently Asked Questions</h2>
          <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
            Find answers to common questions about our notary services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">What is a notary public?</h3>
              <p className="text-gray-600">
                A notary public is a state-appointed official who serves as an impartial witness to the signing of
                important documents and verifies the identity of the signers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">What documents need to be notarized?</h3>
              <p className="text-gray-600">
                Common documents requiring notarization include real estate deeds, wills, trusts, powers of attorney,
                affidavits, loan documents, and certain contracts.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">What ID do I need for notarization?</h3>
              <p className="text-gray-600">
                You'll need a valid, government-issued photo ID such as a driver's license, passport, or state ID card.
                Some states may have additional requirements.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">How much does notarization cost?</h3>
              <p className="text-gray-600">
                At NotaryOutlet, we charge a flat rate of $5 per signature. There may be additional fees for travel or
                special services, which will be disclosed upfront.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Can I get same-day notary service?</h3>
              <p className="text-gray-600">
                Yes! Many of our notaries offer same-day appointments, including evenings and weekends. Simply search
                for available notaries in your area.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-xl font-semibold mb-3">Do you offer mobile notary services?</h3>
              <p className="text-gray-600">
                Yes, many of our notaries will travel to your location, whether it's your home, office, hospital, or
                another convenient location.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Find a verified notary near you and get your documents notarized quickly and affordably.
          </p>
          <Link href="/notaries" passHref>
            <Button className="bg-white text-amber-700 hover:bg-gray-100 px-8 py-6 text-lg">Find a Notary Now</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </main>
  )
}
