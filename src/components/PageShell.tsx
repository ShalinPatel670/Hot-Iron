interface PageShellProps {
  children: React.ReactNode
  className?: string
}

export default function PageShell({ children, className = '' }: PageShellProps) {
  return (
    <div className={`p-6 md:p-8 max-w-[1920px] mx-auto ${className}`}>
      {children}
    </div>
  )
}

