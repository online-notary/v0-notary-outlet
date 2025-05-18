"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Check, Clock, Shield, ArrowRight } from "lucide-react"
import { PriceBadge } from "./components/price-badge"

export default function LandingPage() {
  const [email, setEmail] = useState("")

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <header className="bg-white border-b border-gray-100 py-4">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-2xl font-bold text-amber-700">NotaryOutlet</span>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="#features" className="text-gray-600 hover:text-amber-700">
              Features
            </Link>
            <Link href="#how-it-works" className="text-gray-600 hover:text-amber-700">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-gray-600 hover:text-amber-700">
              Testimonials
            </Link>
            <Button className="bg-amber-700 hover:bg-amber-800">Book Now</Button>
          </nav>
          <Button variant="ghost" size="icon" className="md:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="4" x2="20" y1="12" y2="12" />
              <line x1="4" x2="20" y1="6" y2="6" />
              <line x1="4" x2="20" y1="18" y2="18" />
            </svg>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-amber-50 to-white py-16 md:py-24 flex-grow">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-xl">
              <div className="inline-block mb-6">
                <PriceBadge size="lg" className="transform hover:scale-105 transition-transform" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Notary Services at a <span className="text-amber-700">Flat Rate</span> You'll Love
              </h1>
              <p className="text-xl text-gray-700 mb-8">
                Professional notary services at an unbeatable price. No hidden fees, no surprises—just $5 per signature.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <div className="relative flex-grow">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter your location"
                    className="pl-10 py-6 text-lg rounded-lg border-gray-300"
                  />
                </div>
                <Button className="bg-amber-700 hover:bg-amber-800 py-6 text-lg">Find Notaries Near Me</Button>
              </div>

              <div className="flex flex-wrap gap-8">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-green-100 rounded-full p-1">
                      <Check className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Verified Professionals</h3>
                    <p className="text-gray-600">All notaries are background-checked and certified</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-blue-100 rounded-full p-1">
                      <Clock className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Same-Day Service</h3>
                    <p className="text-gray-600">Many notaries available for urgent requests</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="bg-amber-100 rounded-full p-1">
                      <Shield className="h-5 w-5 text-amber-600" />
                    </div>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">Secure Process</h3>
                    <p className="text-gray-600">Legally binding and fully compliant notarization</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-amber-100 rounded-full opacity-50"></div>
              <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-amber-100 rounded-full opacity-50"></div>

              <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="absolute top-4 right-4 z-10">
                  <div className="bg-green-600 text-white text-sm font-bold px-3 py-1 rounded-full">$5 Flat Rate</div>
                </div>
                <img src="/notary-signing.png" alt="Notary service in action" className="w-full h-auto" />
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">Professional Notarization</h3>
                  <p className="text-gray-600 mb-4">
                    Our notaries come to your location or meet you at a convenient spot. All documents are handled with
                    care and precision.
                  </p>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="flex text-amber-500">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 fill-current"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">4,328 reviews</span>
                    </div>
                    <Button variant="outline" className="group">
                      Book Now
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our $5 Notary Service?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We've simplified notarization while maintaining the highest standards of professionalism and legal
              compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-amber-50 rounded-xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Pricing</h3>
              <p className="text-gray-700">
                Just $5 per signature. No hidden fees, no surprises. We believe in complete transparency in our pricing.
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Mobile Service</h3>
              <p className="text-gray-700">
                Our notaries come to you. Whether at home, office, or a coffee shop, we meet you where it's convenient.
              </p>
            </div>

            <div className="bg-amber-50 rounded-xl p-8 transition-transform hover:scale-105">
              <div className="w-14 h-14 bg-amber-100 rounded-lg flex items-center justify-center mb-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-amber-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Quick Turnaround</h3>
              <p className="text-gray-700">
                Many of our notaries offer same-day service. Get your documents notarized when you need them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Getting your documents notarized is simple and straightforward with our service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div className="bg-white rounded-xl p-8 pt-12 shadow-md h-full">
                <h3 className="text-xl font-bold mb-3 text-center">Find a Notary</h3>
                <p className="text-gray-700 text-center">
                  Enter your location to find verified notaries in your area. Browse profiles and reviews.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div className="bg-white rounded-xl p-8 pt-12 shadow-md h-full">
                <h3 className="text-xl font-bold mb-3 text-center">Schedule a Meeting</h3>
                <p className="text-gray-700 text-center">
                  Book an appointment at a time and place that works for you. Many notaries offer same-day service.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-amber-700 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div className="bg-white rounded-xl p-8 pt-12 shadow-md h-full">
                <h3 className="text-xl font-bold mb-3 text-center">Get Notarized</h3>
                <p className="text-gray-700 text-center">
                  Meet with your notary, have your documents notarized, and pay the flat $5 fee per signature.
                </p>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Button className="bg-amber-700 hover:bg-amber-800 py-6 px-8 text-lg">Find a Notary Now</Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Thousands of satisfied customers have used our $5 notary service.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "The notary was prompt, professional, and made the process incredibly easy. I needed documents notarized
                for a real estate closing, and everything went smoothly."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                  <img src="/diverse-person-portrait.png" alt="Sarah Johnson" />
                </div>
                <div>
                  <div className="font-semibold">Sarah Johnson</div>
                  <div className="text-sm text-gray-500">Real Estate Transaction</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "I needed a mobile notary for my elderly mother who couldn't leave her home. The notary was kind,
                patient, and explained everything clearly. The $5 flat rate was a great value!"
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                  <img src="/thoughtful-man.png" alt="Michael Rodriguez" />
                </div>
                <div>
                  <div className="font-semibold">Michael Rodriguez</div>
                  <div className="text-sm text-gray-500">Power of Attorney</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-8 shadow-md border border-gray-100">
              <div className="flex items-center text-amber-500 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-6">
                "I had an urgent document that needed notarization on a Sunday. NotaryOutlet found me a notary within an
                hour! Incredible service when I really needed it."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full overflow-hidden mr-4">
                  <img src="/diverse-woman-portrait.png" alt="Jennifer Lee" />
                </div>
                <div>
                  <div className="font-semibold">Jennifer Lee</div>
                  <div className="text-sm text-gray-500">Urgent Business Documents</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-amber-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Find a verified notary near you and get your documents notarized quickly and affordably.
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <Input
                type="email"
                placeholder="Enter your email"
                className="py-6 text-lg rounded-lg border-white/20 bg-white/10 text-white placeholder:text-white/70"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button className="bg-white text-amber-700 hover:bg-gray-100 py-6 text-lg">Get Started</Button>
            </div>
            <p className="text-sm mt-4 text-white/80">We'll send you information about notary services in your area.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">NotaryOutlet</h3>
              <p className="mb-4">Professional $5 notary services nationwide.</p>
              <div className="bg-green-600 text-white inline-block px-3 py-1 rounded-full text-sm font-bold">
                $5 Flat Rate
              </div>
            </div>

            <div>
              <h3 className="text-white text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Find a Notary
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
                    Mobile Notary
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-amber-500">
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
  )
}
