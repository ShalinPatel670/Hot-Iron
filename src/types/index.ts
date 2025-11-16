export interface Auction {
  id: string
  title: string
  region: string
  product: string
  currentPrice: number
  co2Intensity: number
  baselineCo2: number
  volumeTotal: number
  volumeRemaining: number
  auctionType: 'Uniform-price' | 'Pay-as-bid' | 'Dutch'
  deliveryWindow: string
  endDate: string
}

export interface Order {
  id: string
  product: string
  region: string
  volume: number
  price: number
  co2VsBaseline: number
  greenShare: number
  status: 'Pending' | 'Settled' | 'In transit' | 'Cancelled'
  counterparty: string
  createdAt: string
  settledAt?: string
}

export interface Loan {
  id: string
  lenderName: string
  lenderRating: string
  effectiveRate: number
  tenor: string
  maxAmount: number
  linkedTo: {
    type: 'order' | 'auction'
    id: string
    name: string
  }
  netCostImpact: number
  co2Note: string
}

export interface Activity {
  id: string
  type: 'auction' | 'order' | 'loan'
  title: string
  status: string
  timestamp: string
  metadata?: Record<string, any>
}

export interface AnalyticsData {
  co2Reduced: { date: string; value: number }[]
  greenPremium: { date: string; value: number }[]
  regionalBreakdown: { region: string; volume: number; co2Intensity: number }[]
}

