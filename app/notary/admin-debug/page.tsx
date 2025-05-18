"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { doc, getDoc } from "firebase/firestore"
import { firestore } from "@/lib/firebase"
import { getAuth } from "firebase/auth"

export default function AdminDebugPage() {
  const { user, userData, isAdmin, loading, error } = useAuth()
  const [firestoreData, setFirestoreData] = useState<any>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [authState, setAuthState] = useState<any>(null)

  const fetchUserData = async () => {
    try {
      // Get current auth state
      const auth = getAuth()
      const currentUser = auth.currentUser
      setAuthState({
        currentUser: currentUser
          ? {
              uid: currentUser.uid,
              email: currentUser.email,
              emailVerified: currentUser.emailVerified,
            }
          : null,
      })

      if (!currentUser) {
        setFetchError("No user is currently signed in")
        return
      }

      // Try to fetch from users collection
      try {
        const userDoc = await getDoc(doc(firestore, "users", currentUser.uid))
        if (userDoc.exists()) {
          setFirestoreData({
            collection: "users",
            id: currentUser.uid,
            data: userDoc.data(),
          })
          return
        }
      } catch (err) {
        console.error("Error fetching from users collection:", err)
      }

      // Try to fetch from notaries collection
      try {
        const notaryDoc = await getDoc(doc(firestore, "notaries", currentUser.uid))
        if (notaryDoc.exists()) {
          setFirestoreData({
            collection: "notaries",
            id: currentUser.uid,
            data: notaryDoc.data(),
          })
          return
        }
      } catch (err) {
        console.error("Error fetching from notaries collection:", err)
      }

      setFetchError("User document not found in Firestore (checked both users and notaries collections)")
    } catch (err) {
      console.error("Error in fetchUserData:", err)
      setFetchError(err instanceof Error ? err.message : "Unknown error")
    }
  }

  useEffect(() => {
    fetchUserData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        <span className="ml-2 text-amber-700">Loading...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Debug Page</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Logged in:</strong> {user ? "Yes" : "No"}
            </p>
            <p>
              <strong>User ID:</strong> {user?.uid || "Not logged in"}
            </p>
            <p>
              <strong>Email:</strong> {user?.email || "Not available"}
            </p>

            <div className="mt-4">
              <h3 className="font-semibold">Raw Auth State:</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">{JSON.stringify(authState, null, 2)}</pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Data from Context</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              <strong>Role:</strong> {userData?.role || "Not set"}
            </p>
            <p>
              <strong>Is Admin:</strong> {isAdmin ? "Yes" : "No"}
            </p>
            <p>
              <strong>Full Name:</strong> {userData?.fullName || "Not set"}
            </p>
            <p>
              <strong>Is Approved:</strong> {userData?.isApproved ? "Yes" : "No"}
            </p>

            <div className="mt-4">
              <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60">{JSON.stringify(userData, null, 2)}</pre>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded">
                <strong>Error:</strong> {error.message}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Raw Firestore Data</CardTitle>
          </CardHeader>
          <CardContent>
            {fetchError ? (
              <p className="text-red-500">{fetchError}</p>
            ) : firestoreData ? (
              <div>
                <p>
                  <strong>Collection:</strong> {firestoreData.collection}
                </p>
                <p>
                  <strong>Document ID:</strong> {firestoreData.id}
                </p>
                <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-60 mt-2">
                  {JSON.stringify(firestoreData.data, null, 2)}
                </pre>
              </div>
            ) : (
              <p>No data fetched yet</p>
            )}

            <Button onClick={fetchUserData} className="mt-4">
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Troubleshooting Steps</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>
            <strong>Check your role:</strong> Your user document must have <code>role: "admin"</code> (lowercase,
            string)
          </li>
          <li>
            <strong>Check authentication:</strong> Make sure you're logged in with the correct account
          </li>
          <li>
            <strong>Check Firestore rules:</strong> Your rules must allow reading the notaries collection
          </li>
          <li>
            <strong>Try direct access:</strong> Visit{" "}
            <a href="/notary/admin" className="text-blue-600 underline">
              /notary/admin
            </a>{" "}
            directly
          </li>
          <li>
            <strong>Clear cache:</strong> Try clearing your browser cache and cookies
          </li>
        </ol>
      </div>
    </div>
  )
}
