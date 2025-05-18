interface CertificateBadgeProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function CertificateBadge({ className = "", size = "md" }: CertificateBadgeProps) {
  const sizeClasses = {
    sm: "max-w-xs",
    md: "max-w-sm",
    lg: "max-w-md",
  }

  return (
    <div className={`${sizeClasses[size]} mx-auto ${className}`}>
      <div className="aspect-[2/1] w-full bg-[#f5eed5] rounded-md border-2 border-amber-300/50 shadow-md relative overflow-hidden">
        {/* Decorative border */}
        <div className="absolute inset-0 p-3 pointer-events-none">
          <div
            className="w-full h-full border-8 border-transparent rounded-md"
            style={{
              backgroundImage:
                "linear-gradient(to right, #f5eed5, #f5eed5), linear-gradient(to right, #f5eed5, #f5eed5), linear-gradient(to bottom, #f5eed5, #f5eed5), linear-gradient(to bottom, #f5eed5, #f5eed5), url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjIwIiB2aWV3Qm94PSIwIDAgMTAwIDIwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0wLDEwIEMxMCwxNSAyMCw1IDMwLDEwIEM0MCwxNSA1MCw1IDYwLDEwIEM3MCwxNSA4MCw1IDkwLDEwIEMxMDAsMTUgMTEwLDUgMTIwLDEwIiBmaWxsPSJub25lIiBzdHJva2U9IiNkM2JjNmEiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW9wYWNpdHk9IjAuNSIvPjwvc3ZnPg==')",
              backgroundClip: "padding-box, padding-box, padding-box, padding-box, border-box",
              backgroundOrigin: "padding-box, padding-box, padding-box, padding-box, border-box",
              backgroundPosition: "top right, bottom left, bottom right, top left, 0 0",
              backgroundRepeat: "no-repeat, no-repeat, no-repeat, no-repeat, repeat",
              backgroundSize:
                "calc(100% - 20px) calc(100% - 20px), calc(100% - 20px) calc(100% - 20px), calc(100% - 20px) calc(100% - 20px), calc(100% - 20px) calc(100% - 20px), 100px 20px",
            }}
          ></div>
        </div>

        <div className="absolute inset-0 flex items-center p-4 md:p-6">
          {/* Green $5 circle */}
          <div className="mr-4 md:mr-6">
            <div className="rounded-full bg-green-600 flex items-center justify-center border border-green-700 w-16 h-16 md:w-20 md:h-20">
              <span className="text-white font-bold text-2xl md:text-3xl flex items-center">
                <span className="text-base md:text-lg mr-0.5">$</span>5
              </span>
            </div>
          </div>

          {/* Text content */}
          <div className="flex flex-col">
            <div className="font-extrabold text-gray-800 uppercase tracking-wider text-2xl md:text-3xl leading-none">
              Flat Rate
            </div>
            <div className="font-bold text-gray-700 uppercase tracking-wide text-lg md:text-xl leading-tight">
              Per Signature
            </div>
          </div>

          {/* Fountain pen icon */}
          <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 text-gray-800 w-10 h-10 md:w-12 md:h-12">
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
        </div>
      </div>
    </div>
  )
}
