export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
      <span className="ml-2 text-amber-700">Loading dashboard...</span>
    </div>
  )
}
