interface AuctionCardProps {
  id: string
  title: string
  region: string
  product: string
  currentPrice: number
  co2Intensity: number
  baselineCo2: number
  volumeRemaining: number
  auctionType: string
  deliveryWindow: string
  onClick?: () => void
  isSelected?: boolean
}

export default function AuctionCard({
  title,
  region,
  product,
  currentPrice,
  co2Intensity,
  baselineCo2,
  volumeRemaining,
  auctionType,
  deliveryWindow,
  onClick,
  isSelected = false,
}: AuctionCardProps) {
  const co2Improvement = ((baselineCo2 - co2Intensity) / baselineCo2) * 100
  const co2Advantage = co2Improvement > 0 ? co2Improvement : 0
  const maxAdvantage = 50 // Normalize to 50% max for progress bar

  return (
    <div
      onClick={onClick}
      className={`glass p-4 cursor-pointer console-transition hover:bg-white/10 hover:border-white/18 ${
        isSelected ? 'ring-1 ring-inset ring-constructivist-red/30' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left: Title and location */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-neutral-text mb-0.5 truncate">{title}</h3>
          <div className="flex items-center gap-1.5 text-xs text-secondary-text">
            <span>{region}</span>
            <span>•</span>
            <span>{product}</span>
          </div>
        </div>

        {/* Middle: Bid price and volume */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-secondary-text mb-0.5">Bid Price</div>
            <div className="text-sm font-semibold text-neutral-text">${currentPrice.toLocaleString()}/ton</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-secondary-text mb-0.5">Volume</div>
            <div className="text-sm font-semibold text-neutral-text">{volumeRemaining.toLocaleString()} tons</div>
          </div>
        </div>

        {/* Right: CO₂ difference and progress indicator */}
        <div className="flex items-center gap-4 min-w-[140px]">
          <div className="text-right flex-1">
            <div className="text-xs text-secondary-text mb-0.5">CO₂ Difference</div>
            <div className={`text-sm font-semibold ${
              co2Improvement > 0 ? 'text-carbon-green' : 'text-constructivist-red'
            }`}>
              {co2Improvement > 0 ? '-' : '+'}{Math.abs(co2Improvement).toFixed(0)}%
            </div>
          </div>
          <div className="w-12 h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all ${
                co2Improvement > 0 ? 'bg-carbon-green' : 'bg-constructivist-red'
              }`}
              style={{ width: `${Math.min((co2Advantage / maxAdvantage) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

