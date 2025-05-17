import NotaryLoginForm from "@/app/components/notary/NotaryLoginForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NotaryLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Notary Login</h1>
          <p className="text-gray-600 mt-2">Access your $5 notary dashboard</p>
        </div>

        <NotaryLoginForm />
      </div>
    </div>
  )
}
