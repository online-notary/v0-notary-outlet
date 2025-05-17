"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function AdminTroubleshootingPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Admin Troubleshooting Guide</h1>
        <p className="text-gray-600 mb-8">Steps to diagnose and fix admin dashboard issues</p>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Common Issues & Solutions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Server-Side Exceptions</h3>
                <p className="mb-2">
                  If you're seeing "a server-side exception has occurred" errors, this usually indicates an issue with:
                </p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Firebase configuration</li>
                  <li>Authentication setup</li>
                  <li>Database access permissions</li>
                  <li>Code errors in server components</li>
                </ul>
                <div className="bg-amber-50 p-4 rounded-md">
                  <p className="font-medium text-amber-800">Recommended solution:</p>
                  <p className="text-amber-700">
                    Try accessing the minimal admin page at <code>/minimal-admin</code> which has no dependencies on
                    Firebase or authentication.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">2. Authentication Issues</h3>
                <p className="mb-2">If you're having trouble with admin access:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Verify you're logged in with the correct email (amy@mediadrops.net)</li>
                  <li>Try logging out and logging back in</li>
                  <li>Clear your browser cache and cookies</li>
                  <li>Try using an incognito/private browsing window</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3. Firebase Configuration</h3>
                <p className="mb-2">Check your Firebase configuration:</p>
                <ul className="list-disc pl-6 space-y-1 mb-4">
                  <li>Verify all environment variables are correctly set</li>
                  <li>Check Firebase console for any service disruptions</li>
                  <li>Ensure Firestore rules allow read/write access</li>
                  <li>Confirm your Firebase project is properly set up</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Try These Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link href="/minimal-admin">
                  <Button className="w-full">Minimal Admin Page</Button>
                </Link>
                <Link href="/admin-static">
                  <Button className="w-full">Static Admin Page</Button>
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
              <CardTitle>Next Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                If you can access the minimal admin pages but not the regular admin dashboard, the issue is likely with
                Firebase or authentication configuration.
              </p>
              <p>
                Try checking your browser console for specific error messages that might provide more details about the
                issue.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
