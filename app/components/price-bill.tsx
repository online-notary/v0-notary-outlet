interface PriceBillProps {
  className?: string
}

export function PriceBill({ className = "" }: PriceBillProps) {
  return (
    <div className={`relative max-w-md mx-auto ${className}`}>
      <div className="aspect-[2.41/1] w-full bg-[#f0f5e5] rounded-lg border-2 border-green-900/30 overflow-hidden shadow-lg">
        {/* Background patterns */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(#22c55e_1px,transparent_1px)] [background-size:8px_8px] opacity-5"></div>
          <div className="absolute inset-0 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_50%,#000_50%,#000_75%,transparent_75%,transparent)] bg-[length:4px_4px] opacity-5"></div>
        </div>

        {/* Ornate border design */}
        <div className="absolute inset-0 border-[8px] border-transparent box-border bg-origin-border bg-clip-border bg-[length:16px_16px] bg-[linear-gradient(45deg,#1e5631_25%,transparent_25%,transparent_50%,#1e5631_50%,#1e5631_75%,transparent_75%,transparent)] opacity-10"></div>

        {/* Top text - Federal Reserve Note */}
        <div className="absolute top-3 left-0 right-0 text-center text-green-900 font-serif uppercase tracking-widest text-lg font-bold">
          Federal Reserve Note
        </div>

        {/* Corner 5s */}
        <div className="absolute top-2 left-6 text-green-900 font-bold text-5xl">5</div>
        <div className="absolute top-2 right-6 text-green-900 font-bold text-5xl">5</div>
        <div className="absolute bottom-2 left-6 text-green-900 font-bold text-5xl">5</div>
        <div className="absolute bottom-2 right-6 text-green-900 font-bold text-5xl">5</div>

        {/* Lincoln portrait placeholder - left side */}
        <div className="absolute left-[12%] top-1/2 transform -translate-y-1/2 w-[25%] aspect-[1/1.3] rounded-full overflow-hidden border-2 border-green-900/30">
          <div className="w-full h-full bg-green-900/5 flex items-center justify-center">
            <div className="w-[85%] h-[85%] rounded-full bg-green-900/10 flex items-center justify-center">
              <span className="text-green-900 font-bold text-4xl">$5</span>
            </div>
          </div>
        </div>

        {/* The United States of America */}
        <div className="absolute top-12 left-0 right-0 text-center text-green-900 font-serif uppercase tracking-widest text-lg font-bold">
          The United States of America
        </div>

        {/* Main content - $5.00 FLAT RATE */}
        <div className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/4 text-center">
          <div className="font-bold text-green-900 uppercase tracking-tight leading-none text-5xl">$5.00</div>
          <div className="font-bold text-green-900 uppercase tracking-tight leading-tight text-2xl mt-1">FLAT RATE</div>
          <div className="font-medium text-green-900 uppercase tracking-tight leading-tight text-xl mt-1">
            PER SIGNATURE
          </div>
        </div>

        {/* Bottom text - FIVE DOLLARS */}
        <div className="absolute bottom-3 left-0 right-0 text-center text-green-900 font-serif uppercase tracking-widest text-lg font-bold">
          Five Dollars
        </div>

        {/* Treasury Seal */}
        <div className="absolute bottom-10 right-12 w-16 h-16 rounded-full border-2 border-green-900/30 flex items-center justify-center">
          <div className="w-[85%] h-[85%] rounded-full bg-green-900/10 flex items-center justify-center">
            <div className="w-[70%] h-[70%] rounded-full border border-green-900/20"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
