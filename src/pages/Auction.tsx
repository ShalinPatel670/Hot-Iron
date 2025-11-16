import { useState, useEffect, useMemo, useRef } from 'react'
import PageShell from '../components/PageShell'
import Pill from '../components/Pill'
import Skeleton from '../components/Skeleton'
import Tag from '../components/Tag'
import { backendClient } from '../lib/backendClient'
import { AuctionRunRequest } from '../types'
import { useNotifications } from '../context/NotificationContext'
import { useAuctionData } from '../context/AuctionDataContext'

export default function AuctionPage() {
  const { pushNotification } = useNotifications()
  const { latestRun, setLatestRun } = useAuctionData()
  
  const [buyerAddress, setBuyerAddress] = useState('chicago, il')
  const [useCoordinates, setUseCoordinates] = useState(false)
  const [lat, setLat] = useState<number | ''>(41.8781)
  const [lon, setLon] = useState<number | ''>(-87.6298)
  const [quantityTons, setQuantityTons] = useState(10000)
  const [timescale, setTimescale] = useState<'one-time' | 'monthly' | 'biannually' | 'annually'>('one-time')
  const [greenOnly, setGreenOnly] = useState(false)
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [backendConnected, setBackendConnected] = useState<boolean | null>(null)
  const [revealedBidIndices, setRevealedBidIndices] = useState<Set<number>>(new Set())
  const [showWinner, setShowWinner] = useState(false)
  const [isRevealing, setIsRevealing] = useState(false)
  const processedAuctionRef = useRef<string | null>(null)
  const timeoutRefs = useRef<number[]>([])

  // Check backend connection on mount
  useEffect(() => {
    backendClient.healthCheck()
      .then(() => setBackendConnected(true))
      .catch(() => setBackendConnected(false))
  }, [])

  // Recalculate sorted bids when latestRun changes
  const sortedBids = useMemo(() => {
    if (!latestRun) return []
    const bids = greenOnly
      ? latestRun.bids.filter((bid) => bid.is_eaf)
      : latestRun.bids
    return [...bids].sort((a, b) => a.net_price_per_ton - b.net_price_per_ton)
  }, [latestRun, greenOnly])

  // Progressive bid reveal effect
  useEffect(() => {
    if (!latestRun) return

    // Create a unique ID for this auction run (using winner + total cost + filter state)
    const auctionId = `${latestRun.winner.seller_name}-${latestRun.winner.net_total}-${greenOnly}`
    
    // Skip if we've already processed this auction
    if (processedAuctionRef.current === auctionId) return

    // Get sorted bids for this effect (don't depend on the memoized version)
    const bids = greenOnly
      ? latestRun.bids.filter((bid) => bid.is_eaf)
      : latestRun.bids
    const currentSortedBids = [...bids].sort((a, b) => a.net_price_per_ton - b.net_price_per_ton)
    
    if (currentSortedBids.length === 0) return

    // Reset reveal state when new auction result comes in
    setRevealedBidIndices(new Set())
    setShowWinner(false)
    setIsRevealing(true)

    // Mark this auction as processed BEFORE starting timeouts
    processedAuctionRef.current = auctionId

    // Shuffle all bids randomly (including winner)
    const shuffledBids = [...currentSortedBids].sort(() => Math.random() - 0.5)
    
    // Reveal bids one by one
    let currentIndex = 0
    const revealNext = () => {
      if (currentIndex >= shuffledBids.length) {
        // All bids revealed, show winner after a short delay
        const timeout = setTimeout(() => {
          setShowWinner(true)
          setIsRevealing(false)
        }, 500)
        timeoutRefs.current.push(timeout)
        return
      }

      // Find the original index of this bid in the sorted list
      const bid = shuffledBids[currentIndex]
      const originalIndex = currentSortedBids.findIndex(b => b.seller_name === bid.seller_name)
      
      if (originalIndex !== -1) {
        setRevealedBidIndices(prev => new Set([...prev, originalIndex]))
      }
      
      currentIndex++
      
      // Random delay between 1000ms and 2000ms before next bid
      if (currentIndex < shuffledBids.length) {
        const delay = 1000 + Math.random() * 1000
        const timeout = setTimeout(revealNext, delay)
        timeoutRefs.current.push(timeout)
      } else {
        // This was the last bid, show winner
        const timeout = setTimeout(() => {
          setShowWinner(true)
          setIsRevealing(false)
        }, 500)
        timeoutRefs.current.push(timeout)
      }
    }

    // Start revealing after initial delay
    const initialTimeout = setTimeout(revealNext, 500)
    timeoutRefs.current.push(initialTimeout)

    // Cleanup function
    return () => {
      timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
      timeoutRefs.current = []
    }
  }, [latestRun, greenOnly])

  const knownAddresses = [
    'central us warehouse',
    'chicago, il',
    'pittsburgh, pa',
  ]

  const handleRunAuction = async () => {
    setLoading(true)
    setError(null)
    
    // Clear any existing timeouts and reset processed auction
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current = []
    processedAuctionRef.current = null
    setRevealedBidIndices(new Set())
    setShowWinner(false)
    setIsRevealing(false)

    try {
      const request: AuctionRunRequest = {
        quantity_tons: quantityTons,
      }

      if (useCoordinates && lat !== '' && lon !== '') {
        request.lat = Number(lat)
        request.lon = Number(lon)
      } else {
        request.buyer_address = buyerAddress
      }

      const result = await backendClient.runAuction(request)
      setLatestRun(result)

      // Push notification
      pushNotification({
        type: 'auction',
        title: 'Auction completed',
        body: `${result.winner.seller_name} wins with net price $${result.winner.net_price_per_ton.toFixed(2)}/ton for total cost $${result.winner.net_total.toLocaleString()}`,
        severity: 'success',
        channels: ['push'],
        entityRef: {
          type: 'auction',
          id: 'latest',
          name: 'Latest Auction Run',
        },
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to run auction'
      setError(errorMessage)
      pushNotification({
        type: 'system',
        title: 'Auction failed',
        body: errorMessage,
        severity: 'warning',
        channels: ['push'],
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageShell>
      {/* Input Form */}
      <div className="glass p-6 mb-6">
        <h2 className="text-2xl font-bold text-off-white mb-6">Run Auction</h2>
        
        <div className="space-y-4">
          {/* Address vs Coordinates Toggle */}
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={!useCoordinates}
                onChange={() => setUseCoordinates(false)}
                className="w-4 h-4 text-constructivist-red focus:ring-constructivist-red"
              />
              <span className="text-sm text-white/70">Use Address</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={useCoordinates}
                onChange={() => setUseCoordinates(true)}
                className="w-4 h-4 text-constructivist-red focus:ring-constructivist-red"
              />
              <span className="text-sm text-white/70">Use Coordinates</span>
            </label>
          </div>

          {!useCoordinates ? (
            <div>
              <label className="block text-sm text-white/60 mb-2">
                Buyer Warehouse Address
              </label>
              <input
                type="text"
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="e.g., chicago, il"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
              />
              <div className="text-xs text-white/50 mt-1">
                Known addresses: {knownAddresses.join(', ')}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Latitude</label>
                <input
                  type="number"
                  value={lat}
                  onChange={(e) => setLat(e.target.value === '' ? '' : Number(e.target.value))}
                  step={0.0001}
                  min={-90}
                  max={90}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
                />
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Longitude</label>
                <input
                  type="number"
                  value={lon}
                  onChange={(e) => setLon(e.target.value === '' ? '' : Number(e.target.value))}
                  step={0.0001}
                  min={-180}
                  max={180}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Quantity (tons)
            </label>
            <input
              type="number"
              value={quantityTons}
              onChange={(e) => setQuantityTons(Number(e.target.value))}
              min={100}
              max={100000}
              step={100}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            />
            <div className="text-xs text-white/50 mt-1">
              Range: 100 - 100,000 tons
            </div>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">
              Timescale
            </label>
            <select
              value={timescale}
              onChange={(e) => setTimescale(e.target.value as 'one-time' | 'monthly' | 'biannually' | 'annually')}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="one-time" style={{ color: 'black' }}>One-time</option>
              <option value="monthly" style={{ color: 'black' }}>Monthly</option>
              <option value="biannually" style={{ color: 'black' }}>Biannually</option>
              <option value="annually" style={{ color: 'black' }}>Annually</option>
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={greenOnly}
              onChange={(e) => setGreenOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-white/5 border-white/10 text-constructivist-red focus:ring-constructivist-red"
            />
            <span className="text-sm text-white/70">Show only green (EAF) sellers</span>
          </label>

          {backendConnected === false && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300 mb-4">
              <div className="font-semibold mb-1">Backend Not Connected</div>
              <div className="text-sm">
                Cannot reach the backend server. Please start it with:
              </div>
              <div className="text-xs font-mono mt-2 bg-black/20 p-2 rounded">
                uvicorn backend.server:app --reload --port 8000
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300">
              <div className="font-semibold mb-1">Error</div>
              <div className="text-sm">{error}</div>
            </div>
          )}

          <button
            onClick={handleRunAuction}
            disabled={loading || (!useCoordinates && !buyerAddress) || (useCoordinates && (lat === '' || lon === ''))}
            className="w-full bg-constructivist-red hover:bg-constructivist-red/90 disabled:bg-white/10 disabled:text-white/40 text-off-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
          >
            {loading ? 'Running Auction...' : 'Run Auction'}
          </button>
        </div>
      </div>

      {/* Results */}
      {loading && (
        <div className="glass p-6">
          <Skeleton />
        </div>
      )}

      {latestRun && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-[35%_65%] gap-6">
          {/* Winner Summary */}
          <div className="glass p-6 sticky top-6 h-fit">
            <h3 className="text-xl font-bold text-off-white mb-4">
              {showWinner ? 'Winner' : 'Waiting for bids...'}
            </h3>
            {latestRun.winner && showWinner && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-off-white">
                    {latestRun.winner.seller_name}
                  </span>
                  {latestRun.winner.is_eaf && <Pill variant="green">EAF</Pill>}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-white/60">Transport Mode:</span>
                    <Tag variant="info">{latestRun.winner.transport_mode}</Tag>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Distance:</span>
                    <span className="text-off-white">{latestRun.winner.distance_km.toFixed(0)} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Net Price/ton:</span>
                    <span className="text-xl font-bold text-off-white">
                      ${latestRun.winner.net_price_per_ton.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Total Cost:</span>
                    <span className="text-xl font-bold text-off-white">
                      ${latestRun.winner.net_total.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Volume Discount:</span>
                    <span className="text-off-white">
                      {(latestRun.winner.volume_discount_pct * 100).toFixed(1)}%
                    </span>
                  </div>
                  {latestRun.winner.is_eaf && (
                    <div className="flex justify-between">
                      <span className="text-white/60">EAF Discount:</span>
                      <span className="text-carbon-green">
                        ${latestRun.winner.eaf_discount_total.toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm text-white/60 mb-2">CO₂ Impact</div>
                  <div className="text-lg font-semibold text-carbon-green">
                    {latestRun.winner.is_eaf ? 'Green Steel (EAF)' : 'Standard Steel'}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bid Book Table */}
          <div className="glass p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-off-white">All Bids</h3>
              <div className="text-sm text-white/60">
                {revealedBidIndices.size} / {sortedBids.length} bid{sortedBids.length !== 1 ? 's' : ''}
                {isRevealing && (
                  <span className="ml-2 text-carbon-green animate-pulse">●</span>
                )}
              </div>
            </div>
            {sortedBids.length === 0 ? (
              <div className="text-center text-white/40 py-8">
                No bids match your filters.
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="grid grid-cols-6 gap-4 items-center text-xs text-white/60 pb-2 border-b border-white/10">
                  <div>Seller</div>
                  <div>Mode</div>
                  <div>Distance</div>
                  <div>Net Price/ton</div>
                  <div>Total Cost</div>
                  <div>Volume Disc.</div>
                </div>
                {/* Bids */}
                {sortedBids.map((bid, index) => {
                  const isRevealed = revealedBidIndices.has(index)
                  return (
                    <div
                      key={`${bid.seller_name}-${index}`}
                      className={`transition-all duration-500 ${
                        isRevealed
                          ? 'opacity-100 translate-y-0'
                          : 'opacity-0 -translate-y-2 pointer-events-none'
                      }`}
                    >
                      {isRevealed && (
                        <div className="glass p-4 rounded-lg hover:bg-white/5 transition-colors">
                          <div className="grid grid-cols-6 gap-4 items-center text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-off-white">{bid.seller_name}</span>
                              {bid.is_eaf && <Pill variant="green">EAF</Pill>}
                            </div>
                            <div>
                              <Tag variant="info">{bid.transport_mode}</Tag>
                            </div>
                            <div className="text-white/60">{bid.distance_km.toFixed(0)} km</div>
                            <div className="font-semibold text-off-white">
                              ${bid.net_price_per_ton.toFixed(2)}/ton
                            </div>
                            <div className="font-semibold text-off-white">
                              ${bid.net_total.toLocaleString()}
                            </div>
                            <div className="text-white/60">
                              {(bid.volume_discount_pct * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {!latestRun && !loading && (
        <div className="glass p-12 text-center text-white/40">
          <div className="text-4xl mb-4">⚡</div>
          <div className="text-lg font-medium mb-2">No auction run yet</div>
          <div className="text-sm">Fill out the form above and click "Run Auction" to get started.</div>
        </div>
      )}
    </PageShell>
  )
}
