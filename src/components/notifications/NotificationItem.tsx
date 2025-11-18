import { Notification } from '../../types'
import Tag from '../Tag'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../context/NotificationContext'

interface NotificationItemProps {
  notification: Notification
}

export default function NotificationItem({ notification }: NotificationItemProps) {
  const navigate = useNavigate()
  const { markRead, dismiss } = useNotifications()
  const isRead = !!notification.readAt

  const severityVariants: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    critical: 'error',
    success: 'success',
    warning: 'warning',
    info: 'info',
  }

  const handleClick = () => {
    if (!isRead) {
      markRead(notification.id)
    }

    // Navigate to entity if available
    if (notification.entityRef) {
      if (notification.entityRef.type === 'auction') {
        navigate('/auction')
      } else if (notification.entityRef.type === 'order') {
        navigate('/orders')
      } else if (notification.entityRef.type === 'loan') {
        navigate('/loans')
      }
    }
  }

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation()
    dismiss(notification.id)
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div
      onClick={handleClick}
      className={`glass-strong p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-white/5 ${
        !isRead ? 'ring-1 ring-white/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Tag variant={severityVariants[notification.severity] || 'info'}>
              {notification.type}
            </Tag>
            {!isRead && (
              <span className="w-2 h-2 bg-constructivist-red rounded-full flex-shrink-0"></span>
            )}
          </div>
          <h3 className={`font-semibold mb-1 ${isRead ? 'text-white/70' : 'text-off-white'}`}>
            {notification.title}
          </h3>
          <p className="text-sm text-white/60 line-clamp-2">{notification.body}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-white/40">{formatTime(notification.timestamp)}</span>
            {notification.channels.length > 0 && (
              <span className="text-xs text-white/40">
                • {notification.channels.map((c) => c.toUpperCase()).join(', ')}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/40 hover:text-white/70 transition-colors flex-shrink-0"
          aria-label="Dismiss notification"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}

