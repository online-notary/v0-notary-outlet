interface PriceBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
  inline?: boolean
}

export function PriceBadge({ className = "", size = "md", inline = false }: PriceBadgeProps) {
  const sizeClasses = {
    sm: inline ? "h-8" : "h-16",
    md: inline ? "h-10" : "h-24",
    lg: inline ? "h-12" : "h-32",
  }

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <div
        className={`${sizeClasses[size]} aspect-[2/1] overflow-hidden shadow-md flex items-center justify-between relative rounded-md border border-amber-300/50`}
        style={{
          background: "linear-gradient(to bottom, #f5eed5 0%, #f1e9c6 100%)",
        }}
      >
        {/* Ornate border pattern */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-0 w-16 h-16 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 0 0, transparent 70%, #d3bc6a 70%, #d3bc6a 100%)",
            }}
          ></div>
          <div
            className="absolute top-0 right-0 w-16 h-16 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 100% 0, transparent 70%, #d3bc6a 70%, #d3bc6a 100%)",
            }}
          ></div>
          <div
            className="absolute bottom-0 left-0 w-16 h-16 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 0 100%, transparent 70%, #d3bc6a 70%, #d3bc6a 100%)",
            }}
          ></div>
          <div
            className="absolute bottom-0 right-0 w-16 h-16 opacity-20"
            style={{
              backgroundImage: "radial-gradient(circle at 100% 100%, transparent 70%, #d3bc6a 70%, #d3bc6a 100%)",
            }}
          ></div>

          {/* Wavy border */}
          <div
            className="absolute inset-x-0 top-0 h-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwIiB2aWV3Qm94PSIwIDAgMTAwIDEwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDUgQzUsNS44IDEwLDQgMTUsNSBDMjAsNS44IDI1LDQgMzAsNSBDMzUsNS44IDQwLDQgNDUsNSBDNTAsNS44IDU1LDQgNjAsNSBDNjUsNS44IDcwLDQgNzUsNSBDODAsNS44IDg1LDQgOTAsNSBDOTUsNS44IDEwMCw0IDEwNSw1IiBmaWxsPSJub25lIiBzdHJva2U9IiNkM2JjNmEiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]"
            style={{ backgroundSize: "100px 10px", backgroundRepeat: "repeat-x" }}
          ></div>
          <div
            className="absolute inset-x-0 bottom-0 h-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwIiB2aWV3Qm94PSIwIDAgMTAwIDEwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDUgQzUsNS44IDEwLDQgMTUsNSBDMjAsNS44IDI1LDQgMzAsNSBDMzUsNS44IDQwLDQgNDUsNSBDNTAsNS44IDU1LDQgNjAsNSBDNjUsNS44IDcwLDQgNzUsNSBDODAsNS44IDg1LDQgOTAsNSBDOTUsNS44IDEwMCw0IDEwNSw1IiBmaWxsPSJub25lIiBzdHJva2U9IiNkM2JjNmEiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]"
            style={{ backgroundSize: "100px 10px", backgroundRepeat: "repeat-x" }}
          ></div>
          <div
            className="absolute inset-y-0 left-0 w-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01LDAgQzUuOCw1IDQsMTAgNSwxNSBDNS44LDIwIDQsMjUgNSwzMCBDNS44LDM1IDQsNDAgNSw0NSBDNS44LDUwIDQsNTUgNSw2MCBDNS44LDY1IDQsNzAgNSw3NSBDNS44LDgwIDQsODUgNSw5MCBDNS44LDk1IDQsMTAwIDUsMTA1IiBmaWxsPSJub25lIiBzdHJva2U9IiNkM2JjNmEiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]"
            style={{ backgroundSize: "10px 100px", backgroundRepeat: "repeat-y" }}
          ></div>
          <div
            className="absolute inset-y-0 right-0 w-3 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAgMTAwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik01LDAgQzUuOCw1IDQsMTAgNSwxNSBDNS44LDIwIDQsMjUgNSwzMCBDNS44LDM1IDQsNDAgNSw0NSBDNS44LDUwIDQsNTUgNSw2MCBDNS44LDY1IDQsNzAgNSw3NSBDNS44LDgwIDQsODUgNSw5MCBDNS44LDk1IDQsMTAwIDUsMTA1IiBmaWxsPSJub25lIiBzdHJva2U9IiNkM2JjNmEiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLW9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')]"
            style={{ backgroundSize: "10px 100px", backgroundRepeat: "repeat-y" }}
          ></div>
        </div>

        {/* Green $5 circle */}
        <div className="flex-shrink-0 ml-4">
          <div
            className="rounded-full bg-green-600 flex items-center justify-center border border-green-700"
            style={{
              width: size === "lg" ? "3.5rem" : size === "md" ? "2.75rem" : "2rem",
              height: size === "lg" ? "3.5rem" : size === "md" ? "2.75rem" : "2rem",
            }}
          >
            <span
              className="text-white font-bold flex items-center"
              style={{
                fontSize: size === "lg" ? "1.75rem" : size === "md" ? "1.5rem" : "1.25rem",
              }}
            >
              <span className="text-sm mr-0.5">$</span>5
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-grow flex flex-col items-start justify-center mr-4">
          <div
            className="font-extrabold text-gray-800 uppercase tracking-wide leading-none"
            style={{
              fontSize: size === "lg" ? "1.5rem" : size === "md" ? "1.25rem" : "1rem",
            }}
          >
            Flat Rate
          </div>
          <div
            className="font-bold text-gray-700 uppercase tracking-wide leading-tight"
            style={{
              fontSize: size === "lg" ? "1rem" : size === "md" ? "0.875rem" : "0.75rem",
            }}
          >
            Per Signature
          </div>
        </div>

        {/* Fountain pen icon */}
        {size !== "sm" && (
          <div
            className="absolute bottom-2 right-3 text-gray-700 opacity-80"
            style={{
              width: size === "lg" ? "2rem" : "1.5rem",
              height: size === "lg" ? "2rem" : "1.5rem",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
            </svg>
          </div>
        )}
      </div>
    </div>
  )
}
