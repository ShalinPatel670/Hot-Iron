import { useLocation } from 'react-router-dom'
import NotificationBell from './notifications/NotificationBell'

interface TopBarProps {
  onMenuClick: () => void
}

const pageTitles: Record<string, string> = {
  '/': 'Dashboard',
  '/auction': 'Auction',
  '/orders': 'My Orders',
  '/loans': 'Loans',
  '/analytics': 'Analytics',
  '/account': 'My Account',
}

export default function TopBar({ onMenuClick }: TopBarProps) {
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] || 'Dashboard'

  return (
    <header className="h-16 bg-[#05060A]/75 backdrop-blur-xl border-b border-white/10 px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Menu button (mobile) + Page title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-secondary-text hover:text-neutral-text console-transition"
          aria-label="Open menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="page-title">
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Right: Notifications + User info */}
      <div className="flex items-center gap-4">
        <NotificationBell />
        <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
          <div className="hidden sm:block text-right mr-2">
            <div className="text-sm font-medium text-neutral-text">Acme Steel Corp</div>
            <div className="text-xs text-secondary-text">Procurement Team</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-sm font-semibold text-neutral-text">
            AS
          </div>
        </div>
      </div>
    </header>
  )
}

