interface ChartShellProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  tabs?: { label: string; value: string }[]
  activeTab?: string
  onTabChange?: (value: string) => void
  className?: string
}

export default function ChartShell({
  title,
  subtitle,
  children,
  tabs,
  activeTab,
  onTabChange,
  className = '',
}: ChartShellProps) {
  return (
    <div className={`glass p-6 console-transition hover:bg-white/10 hover:border-white/18 ${className}`}>
      <div className="mb-4">
        <h3 className="section-title mb-1">{title}</h3>
        {subtitle && (
          <p className="text-sm text-secondary-text">{subtitle}</p>
        )}
      </div>

      {tabs && tabs.length > 0 && (
        <div className="flex gap-2 mb-6">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onTabChange?.(tab.value)}
              className={`px-3 py-1.5 text-sm font-medium console-transition rounded-lg relative ${
                activeTab === tab.value
                  ? 'bg-white/7 text-neutral-text'
                  : 'text-secondary-text hover:text-neutral-text hover:bg-white/4'
              }`}
            >
              {activeTab === tab.value && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-constructivist-red rounded-full"></div>
              )}
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <div className="min-h-[300px]">{children}</div>
    </div>
  )
}

