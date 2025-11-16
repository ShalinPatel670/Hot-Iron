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

export type NotificationType = 'auction' | 'order' | 'loan' | 'system'
export type NotificationSeverity = 'critical' | 'info' | 'success' | 'warning'
export type NotificationChannel = 'email' | 'sms' | 'push'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  body: string
  severity: NotificationSeverity
  channels: NotificationChannel[]
  entityRef?: {
    type: 'auction' | 'order' | 'loan'
    id: string
    name: string
  }
  timestamp: string
  readAt?: string
}

export interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  digestMode: boolean
  lastUpdated?: string
}

// Backend API types
export interface Seller {
  name: string
  location: { lat: number; lon: number }
  msrp: number
  base_cost: number
  risk_aversion: number
  is_eaf: boolean
}

export interface BidBreakdown {
  seller_name: string
  distance_km: number
  transport_mode: 'truck' | 'rail' | 'ocean'
  cost_per_ton: number
  risk_buffer_per_ton: number
  offer_price_per_ton: number
  gross_total_undiscounted: number
  volume_discount_pct: number
  volume_discount_total: number
  gross_total: number
  is_eaf: boolean
  eaf_discount_total: number
  net_price_per_ton: number
  net_total: number
  quantity_tons: number
}

export interface AuctionRunResponse {
  winner: BidBreakdown
  bids: BidBreakdown[]
  buyer_location: { lat: number; lon: number }
}

export interface AuctionRunRequest {
  buyer_address?: string
  lat?: number
  lon?: number
  quantity_tons: number
}

