interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
}

export default function Skeleton({
  className = '',
  variant = 'rectangular',
}: SkeletonProps) {
  const baseClasses = 'animate-pulse bg-white/10 rounded'
  const variantClasses = {
    text: 'h-4',
    circular: 'rounded-full',
    rectangular: '',
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      aria-label="Loading"
    />
  )
}

