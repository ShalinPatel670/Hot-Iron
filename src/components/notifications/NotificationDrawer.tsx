import { useState } from 'react'
import Drawer from '../Drawer'
import NotificationItem from './NotificationItem'
import { useNotifications } from '../../context/NotificationContext'
import Tag from '../Tag'

interface NotificationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

type FilterType = 'all' | 'critical' | 'unread'

export default function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
  const { notifications, unreadCount, markAllRead } = useNotifications()
  const [filter, setFilter] = useState<FilterType>('all')

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'critical') return n.severity === 'critical'
    if (filter === 'unread') return !n.readAt
    return true
  })

  const criticalNotifications = filteredNotifications.filter((n) => n.severity === 'critical')
  const otherNotifications = filteredNotifications.filter((n) => n.severity !== 'critical')

  const handleMarkAllRead = () => {
    markAllRead()
  }

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Notifications" position="right">
      <div className="space-y-4">
        {/* Header Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">
              {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'}
            </span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-constructivist-red hover:text-constructivist-red/80 transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {(['all', 'critical', 'unread'] as FilterType[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                filter === f
                  ? 'bg-constructivist-red/20 text-constructivist-red border border-constructivist-red/30'
                  : 'bg-white/5 text-white/70 hover:bg-white/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-white/40">
              <div className="text-4xl mb-2">🔔</div>
              <div>No notifications</div>
            </div>
          ) : (
            <>
              {/* Critical Notifications */}
              {criticalNotifications.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-off-white mb-2 flex items-center gap-2">
                    <Tag variant="error">Critical</Tag>
                    <span className="text-white/60">({criticalNotifications.length})</span>
                  </h3>
                  <div className="space-y-2">
                    {criticalNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}

              {/* Other Notifications */}
              {otherNotifications.length > 0 && (
                <div>
                  {criticalNotifications.length > 0 && (
                    <h3 className="text-sm font-semibold text-off-white mb-2 mt-4">Other</h3>
                  )}
                  <div className="space-y-2">
                    {otherNotifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Drawer>
  )
}

