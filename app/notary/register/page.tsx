import ClientOnly from "@/app/components/client-only"
import NotaryRegistrationForm from "@/app/components/notary/NotaryRegistrationForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotaryRegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Become a $5 Notary</h1>
          <p className="text-gray-600 mt-2">Join our nationwide network of affordable notary professionals</p>
        </div>

        <ClientOnly
          fallback={
            <div className="w-full max-w-2xl mx-auto p-8 border border-gray-200 rounded-lg">
              <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 w-64 bg-gray-200 rounded mb-8"></div>
              <div className="space-y-4">
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          }
        >
          <NotaryRegistrationForm />
        </ClientOnly>
      </div>
    </div>
  )
}
