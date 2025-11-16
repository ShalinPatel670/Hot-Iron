import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { 
  LayoutDashboard, 
  Hammer, 
  Package, 
  Banknote, 
  TrendingUp, 
  User, 
} from 'lucide-react'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/auction', label: 'Auction', icon: Hammer },
  { path: '/orders', label: 'My Orders', icon: Package },
  { path: '/loans', label: 'Loans', icon: Banknote },
  { path: '/analytics', label: 'Analytics', icon: TrendingUp },
]

const secondaryItems = [
  { path: '/account', label: 'My Account', icon: User },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-1 h-6 bg-constructivist-red"></div>
          <div>
            <div className="text-base font-semibold text-slate-50">
              HOT IRON
            </div>
            <div className="text-xs text-secondary-text uppercase tracking-wider">
              AUCTION DESK
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg console-transition relative ${
                  isActive
                    ? 'bg-white/6 backdrop-blur-sm border border-white/10 text-slate-50 font-semibold'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-white/4'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-constructivist-red rounded-r"></div>
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  <span className={`text-sm ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Secondary Navigation */}
      <div className="px-3 py-4 border-t border-white/10 space-y-1">
        {secondaryItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => isMobile && onClose()}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg console-transition relative ${
                  isActive
                    ? 'bg-white/6 backdrop-blur-sm border border-white/10 text-slate-50 font-semibold'
                    : 'text-slate-300 hover:text-slate-100 hover:bg-white/4'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-constructivist-red rounded-r"></div>
                  )}
                  <Icon className={`w-4 h-4 ${isActive ? 'opacity-100' : 'opacity-70'}`} />
                  <span className={`text-xs ${isActive ? 'font-semibold' : 'font-medium'}`}>{item.label}</span>
                </>
              )}
            </NavLink>
          )
        })}
      </div>
    </>
  )

  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
        {/* Mobile Sidebar */}
        <div
          className={`fixed left-0 top-0 h-full w-[260px] bg-[#101118]/90 backdrop-blur-xl border-r border-white/8 z-50 transform console-transition ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebarContent}
        </div>
      </>
    )
  }

  // Desktop Sidebar
  return (
    <aside className="hidden lg:flex lg:w-[260px] bg-[#101118]/90 backdrop-blur-xl border-r border-white/8 flex-col">
      {sidebarContent}
    </aside>
  )
}

