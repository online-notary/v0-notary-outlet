"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function MinimalAdminPage() {
  const [showDebug, setShowDebug] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Minimal Admin Page</h1>
        <p className="text-gray-600 mb-8">This is a minimal admin page with no dependencies</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Admin Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              This is a simplified admin page that doesn't rely on Firebase or authentication. It should load even if
              there are issues with those services.
            </p>
            <div className="flex gap-4 mt-4">
              <Button onClick={() => setShowDebug(!showDebug)}>
                {showDebug ? "Hide Debug Info" : "Show Debug Info"}
              </Button>
              <Link href="/">
                <Button variant="outline">Return to Home</Button>
              </Link>
            </div>

            {showDebug && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <h3 className="font-medium mb-2">Debug Information</h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <strong>Page:</strong> minimal-admin/page.tsx
                  </li>
                  <li>
                    <strong>Client-side rendering:</strong> Yes
                  </li>
                  <li>
                    <strong>Dependencies:</strong> None (no Firebase or Auth)
                  </li>
                  <li>
                    <strong>Current time:</strong> {new Date().toLocaleString()}
                  </li>
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/admin-troubleshooting">
                  <Button className="w-full">Go to Troubleshooting Guide</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline" className="w-full">
                    Return to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Static Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This card contains static content with no dynamic data or dependencies.</p>
              <p className="mt-2">
                If you can see this page but not the other admin pages, it suggests there might be an issue with
                Firebase or authentication in those pages.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
