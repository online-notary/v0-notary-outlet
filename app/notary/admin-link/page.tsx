"use client"

import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Shield } from "lucide-react"

export default function AdminLinkPage() {
  const { isAdmin, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Access</h1>

      {isAdmin ? (
        <div className="bg-green-50 p-4 rounded-md border border-green-200 mb-6">
          <p className="text-green-700 font-medium">You have admin privileges! You can access the admin page.</p>
        </div>
      ) : (
        <div className="bg-red-50 p-4 rounded-md border border-red-200 mb-6">
          <p className="text-red-700 font-medium">
            You do not have admin privileges. Contact the system administrator.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-4">
        <Button asChild disabled={!isAdmin}>
          <Link href="/notary/admin">
            <Shield className="mr-2 h-4 w-4" />
            Go to Notary Admin Page
          </Link>
        </Button>

        <Button asChild variant="outline">
          <Link href="/admin-debug">Check Admin Status</Link>
        </Button>
      </div>
    </div>
  )
}
