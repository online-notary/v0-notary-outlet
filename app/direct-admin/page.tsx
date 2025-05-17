"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function DirectAdminPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [userEmail, setUserEmail] = useState("")

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "")
      setIsAdmin(user.email === "amy@mediadrops.net")
    }
    setLoading(false)
  }, [user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="bg-red-50">
          <CardTitle className="text-red-800">Admin Access</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-2">Current User Information</h2>
              <p>
                <strong>Email:</strong> {userEmail || "Not logged in"}
              </p>
              <p>
                <strong>Admin Status:</strong> {isAdmin ? "Admin" : "Not Admin"}
              </p>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-bold mb-2">Admin Access</h2>
              {isAdmin ? (
                <div className="space-y-4">
                  <p className="text-green-600">You have admin access!</p>
                  <Link href="/admin">
                    <Button className="bg-red-600 hover:bg-red-700">Go to Admin Dashboard</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-red-600">You do not have admin access.</p>
                  <p>
                    Admin access is only available to users with the email: <strong>amy@mediadrops.net</strong>
                  </p>
                  {userEmail && <p>Your current email ({userEmail}) does not match the admin email.</p>}
                </div>
              )}
            </div>

            <div className="border-t pt-4">
              <h2 className="text-xl font-bold mb-2">Navigation</h2>
              <div className="flex gap-4">
                <Link href="/">
                  <Button variant="outline">Home</Button>
                </Link>
                <Link href="/notary-dashboard">
                  <Button variant="outline">Notary Dashboard</Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
