"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminAccessPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Access Hub</h1>
        <p className="text-gray-600 mb-8">Access all administrative functions</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin Access Options</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={() => router.push("/admin")}>
              Standard Admin Dashboard
            </Button>

            <Button className="w-full" onClick={() => router.push("/super-admin")}>
              Super Admin Dashboard
            </Button>

            <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
