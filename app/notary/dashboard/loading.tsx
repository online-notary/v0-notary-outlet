import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-amber-700" />
      <span className="ml-2">Loading dashboard...</span>
    </div>
  )
}
