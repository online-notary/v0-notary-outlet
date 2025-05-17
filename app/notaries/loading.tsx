import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header placeholder */}
      <div className="h-16 bg-white border-b"></div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Search bar placeholder */}
        <Skeleton className="h-14 w-full mb-6" />

        {/* Notary grid placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array(9)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-96">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
        </div>

        {/* Pagination placeholder */}
        <div className="flex justify-center mt-8">
          <Skeleton className="h-10 w-64" />
        </div>
      </main>
    </div>
  )
}
