import { useEffect } from 'react'

interface DrawerProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  position?: 'left' | 'right'
}

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = 'right',
}: DrawerProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`fixed top-0 ${position === 'right' ? 'right-0' : 'left-0'} h-full w-full max-w-md glass-strong z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : position === 'right' ? 'translate-x-full' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          <div className="glass border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-off-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-off-white transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">{children}</div>
        </div>
      </div>
    </>
  )
}

