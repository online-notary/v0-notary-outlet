import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, ArrowLeft } from "lucide-react"

export default function PendingVerificationPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <Link href="/" className="inline-flex items-center text-amber-700 hover:text-amber-800 mb-8">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">Registration Complete</CardTitle>
            <CardDescription className="text-center">Your notary account is pending verification</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">
              Thank you for registering as a notary with NotaryOutlet. Our team will review your credentials and verify
              your notary license.
            </p>
            <p className="mb-4">
              This process typically takes 1-2 business days. You'll receive an email notification once your account is
              verified.
            </p>
            <p className="font-medium">Questions? Contact our support team at support@notaryoutlet.com</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button variant="outline" className="border-amber-700 text-amber-700 hover:bg-amber-50" asChild>
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
