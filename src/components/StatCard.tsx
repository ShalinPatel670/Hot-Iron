interface StatCardProps {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  accent?: 'red' | 'green' | 'neutral'
  className?: string
}

export default function StatCard({
  label,
  value,
  unit,
  trend,
  trendValue,
  accent = 'neutral',
  className = '',
}: StatCardProps) {
  const trendIcon =
    trend === 'up' ? '↑' : trend === 'down' ? '↓' : null
  const trendColor =
    trend === 'up'
      ? 'text-carbon-green border-carbon-green/30'
      : trend === 'down'
      ? 'text-constructivist-red border-constructivist-red/30'
      : 'text-secondary-text border-white/10'

  return (
    <div className={`glass p-5 console-transition hover:bg-white/10 hover:border-white/18 hover:-translate-y-[1px] hover:scale-[1.01] ${className}`}>
      <div className="kpi-label mb-3">
        {label}
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="kpi-number">{value}</span>
        {unit && (
          <span className="text-xs md:text-sm text-secondary-text font-medium">{unit}</span>
        )}
      </div>
      {trend && trendValue && (
        <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-xs font-medium ${trendColor}`}>
          <span>{trendIcon}</span>
          <span>{trendValue}</span>
        </div>
      )}
    </div>
  )
}

