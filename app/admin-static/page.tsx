export default function StaticAdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Static Admin Page</h1>
        <p className="text-gray-600 mb-8">This is a completely static page with no client-side code</p>

        <div className="bg-white rounded-lg border p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Admin Dashboard</h2>
          <p className="mb-4">
            This is a static admin page that doesn't use any client-side JavaScript, React hooks, or external
            dependencies. It should load even if there are issues with those services.
          </p>
          <div className="mt-6 p-4 bg-gray-100 rounded-md">
            <h3 className="font-medium mb-2">Page Information</h3>
            <ul className="space-y-2">
              <li>
                <strong>Page:</strong> admin-static/page.tsx
              </li>
              <li>
                <strong>Type:</strong> Server Component (no "use client" directive)
              </li>
              <li>
                <strong>Dependencies:</strong> None
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">Navigation</h2>
            <div className="space-y-4">
              <div>
                <a
                  href="/minimal-admin"
                  className="block w-full text-center py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Go to Minimal Admin Page
                </a>
              </div>
              <div>
                <a
                  href="/admin-troubleshooting"
                  className="block w-full text-center py-2 px-4 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                >
                  Go to Troubleshooting Guide
                </a>
              </div>
              <div>
                <a
                  href="/"
                  className="block w-full text-center py-2 px-4 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Return to Home
                </a>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-bold mb-4">Static Content</h2>
            <p>This card contains static content with no dynamic data or dependencies.</p>
            <p className="mt-2">
              If you can see this page but not the other admin pages, it suggests there might be an issue with
              client-side JavaScript or React in those pages.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
