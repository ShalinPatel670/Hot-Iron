import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { AuctionRunResponse, BidBreakdown } from '../types'
import { backendClient } from '../lib/backendClient'

const STORAGE_KEY_AUCTION_DATA = 'hot-iron-auction-data'

interface AuctionDataState {
  latestRun: AuctionRunResponse | null
  auctionHistory: AuctionRunResponse[]
}

interface AuctionDataContextValue {
  latestRun: AuctionRunResponse | null
  auctionHistory: AuctionRunResponse[]
  setLatestRun: (run: AuctionRunResponse) => void
  clearHistory: () => void
}

const AuctionDataContext = createContext<AuctionDataContextValue | undefined>(undefined)

export function AuctionDataProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuctionDataState>({
    latestRun: null,
    auctionHistory: [],
  })

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_AUCTION_DATA)
      if (stored) {
        const parsed = JSON.parse(stored)
        setState({
          latestRun: parsed.latestRun || null,
          auctionHistory: parsed.auctionHistory || [],
        })
      }
    } catch (error) {
      console.error('Failed to load auction data from localStorage:', error)
    }
  }, [])

  // Persist to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_AUCTION_DATA, JSON.stringify(state))
    } catch (error) {
      console.error('Failed to save auction data to localStorage:', error)
    }
  }, [state])

  const setLatestRun = (run: AuctionRunResponse) => {
    setState((prev) => ({
      latestRun: run,
      auctionHistory: [run, ...prev.auctionHistory].slice(0, 50), // Keep last 50 runs
    }))
  }

  const clearHistory = () => {
    setState({
      latestRun: null,
      auctionHistory: [],
    })
  }

  const value: AuctionDataContextValue = {
    latestRun: state.latestRun,
    auctionHistory: state.auctionHistory,
    setLatestRun,
    clearHistory,
  }

  return <AuctionDataContext.Provider value={value}>{children}</AuctionDataContext.Provider>
}

export function useAuctionData() {
  const context = useContext(AuctionDataContext)
  if (context === undefined) {
    throw new Error('useAuctionData must be used within an AuctionDataProvider')
  }
  return context
}

