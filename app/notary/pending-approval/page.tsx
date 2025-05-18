"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { ClientOnly } from "@/app/components/client-only"

export default function PendingApprovalPage() {
  const { userData } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut(auth)
    router.push("/")
  }

  return (
    <ClientOnly>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Application Pending</CardTitle>
            <CardDescription className="text-center">Your notary application is currently under review</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">
              <p className="font-medium">Thank you for registering, {userData?.fullName || "Notary"}!</p>
              <p className="mt-2">
                Our team is currently reviewing your application. This process typically takes 1-2 business days. You'll
                receive an email at {userData?.email} once your account has been approved.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-medium">What happens next?</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Our team verifies your notary commission information</li>
                <li>We check your E&O insurance details</li>
                <li>Once approved, you'll gain access to your notary dashboard</li>
                <li>You can then complete your profile and start accepting clients</li>
              </ul>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button variant="outline" onClick={handleSignOut}>
              Sign Out
            </Button>
          </CardFooter>
        </Card>
      </div>
    </ClientOnly>
  )
}
