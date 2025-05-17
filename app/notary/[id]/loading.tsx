import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header placeholder */}
      <div className="h-16 bg-white border-b"></div>

      <main className="container mx-auto px-4 py-8">
        <Skeleton className="h-6 w-32 mb-6" />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column - Profile Info Skeleton */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <Skeleton className="h-64 w-full" />
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-8 w-40" />
                  <Skeleton className="h-6 w-10 rounded-full" />
                </div>
                <Skeleton className="h-4 w-32" />
                <div className="space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-full" />
                </div>
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-10 w-full rounded" />
              </div>
            </div>
          </div>

          {/* Right Column - Details Skeleton */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow mb-6">
              <div className="p-6">
                <Skeleton className="h-6 w-40 mb-4" />
                <div className="flex flex-wrap gap-2">
                  {Array(6)
                    .fill(0)
                    .map((_, i) => (
                      <Skeleton key={i} className="h-8 w-24 rounded-lg" />
                    ))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array(7)
                    .fill(0)
                    .map((_, i) => (
                      <div key={i} className="flex items-center justify-between border-b pb-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-32" />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
