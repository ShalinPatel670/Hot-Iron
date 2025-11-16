interface TagProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export default function Tag({
  children,
  variant = 'default',
  className = '',
}: TagProps) {
  const variants = {
    default: 'bg-white/7 text-neutral-text border-white/12',
    success: 'bg-carbon-green/10 text-carbon-green border-carbon-green/30',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    error: 'bg-constructivist-red/10 text-constructivist-red border-constructivist-red/30',
    info: 'bg-white/7 text-neutral-text border-white/12',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider border ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  )
}

