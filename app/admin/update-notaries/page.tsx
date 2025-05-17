"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuth, onAuthStateChanged, getIdToken } from "firebase/auth"
import { useEffect } from "react"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function UpdateNotariesPage() {
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)

  // Check if user is admin
  useEffect(() => {
    const auth = getAuth()
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdminUser = user.email?.toLowerCase() === "amy@mediadrops.net"
        setIsAdmin(isAdminUser)

        if (isAdminUser) {
          try {
            const token = await getIdToken(user)
            setAuthToken(token)
          } catch (error) {
            console.error("Error getting auth token:", error)
          }
        }
      } else {
        setIsAdmin(false)
        setAuthToken(null)
      }
      setIsCheckingAuth(false)
    })

    return () => unsubscribe()
  }, [])

  const updateNotaries = async () => {
    if (!authToken) {
      setError("Not authenticated as admin")
      return
    }

    try {
      setIsUpdating(true)
      setError(null)
      setResult(null)

      const response = await fetch("/api/admin/update-notaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to update notaries")
      }

      const data = await response.json()
      setResult(data)
    } catch (error: any) {
      console.error("Error updating notaries:", error)
      setError(error.message || "An error occurred while updating notaries")
    } finally {
      setIsUpdating(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                This page is only accessible to administrators with the email address: amy@mediadrops.net
              </p>
              <Button onClick={() => router.push("/")}>Return to Home</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Update Notaries</CardTitle>
            <CardDescription>
              This utility will add the isVisible=true field to all notaries in the database.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This is a one-time migration to ensure all notaries have the isVisible field set to true. This field will
              be used to control visibility in the public directory, separate from the verification status.
            </p>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <Alert className={result.success ? "bg-green-50 border-green-200 mb-4" : "bg-red-50 border-red-200 mb-4"}>
                <div className="flex items-center">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                  )}
                  <AlertTitle>{result.success ? "Success" : "Failed"}</AlertTitle>
                </div>
                <AlertDescription>
                  {result.message}
                  {result.updated !== undefined && (
                    <p className="mt-2">
                      Updated {result.updated} notaries
                      {result.errors > 0 && `, with ${result.errors} errors`}
                    </p>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.push("/admin")}>
              Back to Admin
            </Button>
            <Button onClick={updateNotaries} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update All Notaries"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
