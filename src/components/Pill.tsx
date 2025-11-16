interface PillProps {
  children: React.ReactNode
  variant?: 'default' | 'red' | 'green'
  className?: string
}

export default function Pill({
  children,
  variant = 'default',
  className = '',
}: PillProps) {
  const variants = {
    default: 'bg-white/10 text-white/80',
    red: 'bg-constructivist-red/20 text-constructivist-red border-constructivist-red/30',
    green: 'bg-carbon-green/20 text-carbon-green border-carbon-green/30',
  }

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

