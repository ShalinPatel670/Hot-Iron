import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { Notification, NotificationPreferences } from '../types'
import { mockNotifications, mockActivities, activitiesToNotifications } from '../data/mockData'

const STORAGE_KEY_NOTIFICATIONS = 'hot-iron-notifications'
const STORAGE_KEY_PREFERENCES = 'hot-iron-notification-preferences'

interface NotificationState {
  notifications: Notification[]
  preferences: NotificationPreferences
}

type NotificationAction =
  | { type: 'LOAD_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'PUSH_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'DISMISS'; payload: string }
  | { type: 'SET_PREFERENCES'; payload: NotificationPreferences }

const defaultPreferences: NotificationPreferences = {
  email: true,
  sms: false,
  push: true,
  digestMode: false,
}

function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'LOAD_NOTIFICATIONS':
      return { ...state, notifications: action.payload }
    case 'PUSH_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      }
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, readAt: new Date().toISOString() } : n
        ),
      }
    case 'MARK_ALL_READ':
      const now = new Date().toISOString()
      return {
        ...state,
        notifications: state.notifications.map((n) => (n.readAt ? n : { ...n, readAt: now })),
      }
    case 'DISMISS':
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.payload),
      }
    case 'SET_PREFERENCES':
      return {
        ...state,
        preferences: { ...action.payload, lastUpdated: new Date().toISOString() },
      }
    default:
      return state
  }
}

interface NotificationContextValue {
  notifications: Notification[]
  preferences: NotificationPreferences
  unreadCount: number
  criticalCount: number
  pushNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markRead: (id: string) => void
  markAllRead: () => void
  dismiss: (id: string) => void
  setPreferences: (prefs: Partial<NotificationPreferences>) => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(notificationReducer, {
    notifications: [],
    preferences: defaultPreferences,
  })

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const storedNotifications = localStorage.getItem(STORAGE_KEY_NOTIFICATIONS)
      const storedPreferences = localStorage.getItem(STORAGE_KEY_PREFERENCES)

      let initialNotifications: Notification[] = []
      if (storedNotifications) {
        initialNotifications = JSON.parse(storedNotifications)
      } else {
        // Initialize with mock data + activities converted to notifications
        const activityNotifications = activitiesToNotifications(mockActivities)
        initialNotifications = [...mockNotifications, ...activityNotifications]
      }

      const initialPreferences: NotificationPreferences = storedPreferences
        ? JSON.parse(storedPreferences)
        : defaultPreferences

      dispatch({ type: 'LOAD_NOTIFICATIONS', payload: initialNotifications })
      dispatch({ type: 'SET_PREFERENCES', payload: initialPreferences })
    } catch (error) {
      console.error('Failed to load notifications from localStorage:', error)
      // Fallback to mock data
      const activityNotifications = activitiesToNotifications(mockActivities)
      dispatch({ type: 'LOAD_NOTIFICATIONS', payload: [...mockNotifications, ...activityNotifications] })
      dispatch({ type: 'SET_PREFERENCES', payload: defaultPreferences })
    }
  }, [])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFICATIONS, JSON.stringify(state.notifications))
    } catch (error) {
      console.error('Failed to save notifications to localStorage:', error)
    }
  }, [state.notifications])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PREFERENCES, JSON.stringify(state.preferences))
    } catch (error) {
      console.error('Failed to save preferences to localStorage:', error)
    }
  }, [state.preferences])

  const pushNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    // Filter channels based on preferences
    const enabledChannels = notification.channels.filter((channel) => {
      if (channel === 'email') return state.preferences.email
      if (channel === 'sms') return state.preferences.sms
      if (channel === 'push') return state.preferences.push
      return false
    })

    // Only create notification if at least one channel is enabled
    if (enabledChannels.length === 0) {
      return
    }

    const newNotification: Notification = {
      ...notification,
      id: `NOTIF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      channels: enabledChannels,
    }

    dispatch({ type: 'PUSH_NOTIFICATION', payload: newNotification })
  }

  const markRead = (id: string) => {
    dispatch({ type: 'MARK_READ', payload: id })
  }

  const markAllRead = () => {
    dispatch({ type: 'MARK_ALL_READ' })
  }

  const dismiss = (id: string) => {
    dispatch({ type: 'DISMISS', payload: id })
  }

  const setPreferences = (prefs: Partial<NotificationPreferences>) => {
    dispatch({
      type: 'SET_PREFERENCES',
      payload: { ...state.preferences, ...prefs },
    })
  }

  const unreadCount = state.notifications.filter((n) => !n.readAt).length
  const criticalCount = state.notifications.filter(
    (n) => !n.readAt && n.severity === 'critical'
  ).length

  const value: NotificationContextValue = {
    notifications: state.notifications,
    preferences: state.preferences,
    unreadCount,
    criticalCount,
    pushNotification,
    markRead,
    markAllRead,
    dismiss,
    setPreferences,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

