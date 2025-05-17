"use client"

import { useState } from "react"
import { signOut } from "firebase/auth"
import { auth } from "@/app/lib/firebase"
import { useAuth } from "./AuthProvider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function UserProfile() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    setLoading(true)
    try {
      await signOut(auth)
    } catch (error) {
      console.error("Error signing out:", error)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || "User"} />
            <AvatarFallback>{user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{user.displayName || "User"}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <span className="font-medium">Email verified:</span>{" "}
            <span className={user.emailVerified ? "text-green-600" : "text-amber-600"}>
              {user.emailVerified ? "Yes" : "No"}
            </span>
          </div>
          <div className="text-sm">
            <span className="font-medium">Account created:</span>{" "}
            <span>
              {user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : "Unknown"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-amber-700 text-amber-700 hover:bg-amber-50"
          onClick={handleSignOut}
          disabled={loading}
        >
          {loading ? "Signing out..." : "Sign Out"}
        </Button>
      </CardFooter>
    </Card>
  )
}
