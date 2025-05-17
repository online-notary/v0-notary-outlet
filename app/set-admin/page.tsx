"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { setNotaryAsAdmin } from "@/app/lib/admin-utils"

export default function SetAdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string } | null>(null)

  const adminEmail = "amy@mediadrops.net"

  const handleSetAdmin = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const result = await setNotaryAsAdmin(adminEmail, true)
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: `Error: ${error.message || "Unknown error occurred"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set Admin Status</CardTitle>
          <CardDescription>Set the isAdmin field to true for the notary with email {adminEmail}</CardDescription>
        </CardHeader>
        <CardContent>
          {result && (
            <Alert variant={result.success ? "default" : "destructive"} className="mb-4">
              {result.success ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertTitle>{result.success ? "Success" : "Error"}</AlertTitle>
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}

          <p className="text-sm text-gray-500 mb-4">
            This will set the <code className="bg-gray-100 px-1 py-0.5 rounded">isAdmin</code> field to{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded">true</code> for the notary with email{" "}
            <strong>{adminEmail}</strong> in the Firebase database.
          </p>

          <p className="text-sm text-gray-500">
            After setting this field, you should update the admin access check in your code to look for this field
            instead of hardcoding the email address.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/admin")}>
            Back to Admin
          </Button>
          <Button onClick={handleSetAdmin} disabled={isLoading} className="bg-amber-600 hover:bg-amber-700">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting Admin...
              </>
            ) : (
              "Set as Admin"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
