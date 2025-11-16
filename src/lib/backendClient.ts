/**
 * Backend API client for auction operations.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

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

export interface AuctionRunRequest {
  buyer_address?: string
  lat?: number
  lon?: number
  quantity_tons: number
}

export interface AuctionRunResponse {
  winner: BidBreakdown
  bids: BidBreakdown[]
  buyer_location: { lat: number; lon: number }
}

export interface ApiError {
  detail: string
}

class BackendClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      })

      if (!response.ok) {
        const error: ApiError = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`,
        }))
        throw new Error(error.detail || 'Request failed')
      }

      return response.json()
    } catch (error) {
      // Handle network errors (backend not running, CORS, etc.)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error(
          `Cannot connect to backend at ${this.baseUrl}. ` +
          `Please make sure the backend server is running. ` +
          `Start it with: uvicorn backend.server:app --reload --port 8000`
        )
      }
      throw error
    }
  }

  async getSellers(): Promise<Seller[]> {
    return this.request<Seller[]>('/sellers')
  }

  async runAuction(request: AuctionRunRequest): Promise<AuctionRunResponse> {
    return this.request<AuctionRunResponse>('/auction/run', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async healthCheck(): Promise<{ status: string }> {
    return this.request<{ status: string }>('/health')
  }
}

export const backendClient = new BackendClient()

