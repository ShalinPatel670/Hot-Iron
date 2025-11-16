import { useState } from 'react'
import { Bell } from 'lucide-react'
import { useNotifications } from '../../context/NotificationContext'
import NotificationDrawer from './NotificationDrawer'

export default function NotificationBell() {
  const { unreadCount, criticalCount } = useNotifications()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const hasUnread = unreadCount > 0

  return (
    <>
      <button
        onClick={() => setIsDrawerOpen(true)}
        className="text-secondary-text hover:text-neutral-text console-transition relative"
        aria-label={`Notifications${hasUnread ? ` (${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5" />
        {hasUnread && (
          <span
            className={`absolute top-0 right-0 rounded-full flex items-center justify-center text-xs font-bold text-off-white ${
              criticalCount > 0
                ? 'w-5 h-5 bg-constructivist-red animate-pulse'
                : 'w-1.5 h-1.5 bg-constructivist-red'
            }`}
          >
            {criticalCount > 0 && unreadCount > 9 ? '9+' : criticalCount > 0 ? unreadCount : ''}
          </span>
        )}
      </button>
      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}

