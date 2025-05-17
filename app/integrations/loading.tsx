import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar skeleton */}
      <div className="w-48 bg-white shadow-md flex flex-col h-screen">
        <div className="p-4">
          <Skeleton className="h-6 w-32 mb-2" />
        </div>
        <div className="flex-1 overflow-auto">
          <div className="space-y-1 p-4 pt-0">
            {Array(10)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-8 w-full mb-2" />
              ))}
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="p-4 md:p-6 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="flex-1 overflow-auto px-4 md:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array(24)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="h-40">
                  <Skeleton className="h-full w-full" />
                </div>
              ))}
          </div>
        </div>
        <div className="p-4 md:p-6 border-t">
          <div className="flex justify-center items-center">
            <Skeleton className="h-8 w-32" />
          </div>
        </div>
      </main>
    </div>
  )
}
