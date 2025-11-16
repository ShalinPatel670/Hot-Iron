import { useState } from 'react'
import PageShell from '../components/PageShell'
import AuctionCard from '../components/AuctionCard'
import Modal from '../components/Modal'
import Pill from '../components/Pill'
import { mockAuctions } from '../data/mockData'
import { Auction } from '../types'

export default function AuctionPage() {
  const [selectedAuction, setSelectedAuction] = useState<Auction | null>(mockAuctions[0] || null)
  const [showBidModal, setShowBidModal] = useState(false)
  const [filters, setFilters] = useState({
    region: 'all',
    product: 'all',
    carbonClass: 'all',
    greenOnly: false,
  })
  const [bidQuantity, setBidQuantity] = useState(1000)
  const [bidPrice, setBidPrice] = useState(selectedAuction?.currentPrice || 850)

  const regions = ['US', 'EU', 'India', 'China', 'Other']
  const products = ['Hot Rolled Coil (HRC)', 'Other']
  const carbonClasses = ['Ultra-low', 'Low', 'Standard']

  const filteredAuctions = mockAuctions.filter((auction) => {
    if (filters.region !== 'all' && auction.region !== filters.region) return false
    if (filters.product !== 'all' && auction.product !== filters.product) return false
    if (filters.greenOnly) {
      const improvement = ((auction.baselineCo2 - auction.co2Intensity) / auction.baselineCo2) * 100
      if (improvement < 30) return false
    }
    return true
  })

  const handlePlaceBid = () => {
    setShowBidModal(true)
  }

  const handleConfirmBid = () => {
    // In a real app, this would submit the bid
    alert(`Bid placed: ${bidQuantity} tons at $${bidPrice}/ton`)
    setShowBidModal(false)
  }

  const co2Saved = selectedAuction
    ? ((selectedAuction.baselineCo2 - selectedAuction.co2Intensity) * bidQuantity).toFixed(0)
    : 0
  const totalCost = bidQuantity * bidPrice
  const greenPremium = selectedAuction
    ? ((bidPrice - 800) / 800 * 100).toFixed(1)
    : '0'

  return (
    <PageShell>
      {/* Filters */}
      <div className="glass p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Region:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setFilters({ ...filters, region: 'all' })}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  filters.region === 'all'
                    ? 'bg-constructivist-red/20 text-constructivist-red border border-constructivist-red/30'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                All
              </button>
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setFilters({ ...filters, region })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    filters.region === region
                      ? 'bg-constructivist-red/20 text-constructivist-red border border-constructivist-red/30'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Product:</span>
            <select
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="all">All</option>
              {products.map((product) => (
                <option key={product} value={product}>
                  {product}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white/60">Carbon Class:</span>
            <select
              value={filters.carbonClass}
              onChange={(e) => setFilters({ ...filters, carbonClass: e.target.value })}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="all">All</option>
              {carbonClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.greenOnly}
              onChange={(e) => setFilters({ ...filters, greenOnly: e.target.checked })}
              className="w-4 h-4 rounded bg-white/5 border-white/10 text-constructivist-red focus:ring-constructivist-red"
            />
            <span className="text-sm text-white/70">Show only green-advantaged</span>
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[65%_35%] gap-6">
        {/* Auction List */}
        <div className="space-y-4">
          {filteredAuctions.length === 0 ? (
            <div className="glass p-12 text-center text-white/40">
              No auctions match your filters.
            </div>
          ) : (
            filteredAuctions.map((auction) => (
              <AuctionCard
                key={auction.id}
                {...auction}
                isSelected={selectedAuction?.id === auction.id}
                onClick={() => {
                  setSelectedAuction(auction)
                  setBidPrice(auction.currentPrice)
                }}
              />
            ))
          )}
        </div>

        {/* Selected Auction Detail & Bid Panel */}
        {selectedAuction && (
          <div className="glass p-6 sticky top-6 h-fit">
            <h2 className="text-2xl font-bold text-off-white mb-4">{selectedAuction.title}</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-white/60">Region:</span>
                <span className="text-off-white font-medium">{selectedAuction.region}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Product:</span>
                <span className="text-off-white font-medium">{selectedAuction.product}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Delivery Window:</span>
                <span className="text-off-white font-medium">{selectedAuction.deliveryWindow}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Auction Type:</span>
                <span className="text-off-white font-medium">{selectedAuction.auctionType}</span>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6 mb-6">
              <h3 className="text-lg font-bold text-off-white mb-4">Bid Simulator</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Quantity (tons)
                  </label>
                  <input
                    type="number"
                    value={bidQuantity}
                    onChange={(e) => setBidQuantity(Number(e.target.value))}
                    min={1}
                    max={selectedAuction.volumeRemaining}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
                  />
                  <div className="text-xs text-white/50 mt-1">
                    Max: {selectedAuction.volumeRemaining.toLocaleString()} tons
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-white/60 mb-2">
                    Bid Price ($/ton)
                  </label>
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(Number(e.target.value))}
                    min={0}
                    step={1}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
                  />
                  <div className="text-xs text-white/50 mt-1">
                    Current clearing: ${selectedAuction.currentPrice.toLocaleString()}/ton
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-2 p-4 glass-strong rounded-lg">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Cost:</span>
                  <span className="text-xl font-bold text-off-white">
                    ${totalCost.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">CO₂ Saved vs Grey:</span>
                  <span className="text-lg font-semibold text-carbon-green">
                    {co2Saved} kg
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Implied Green Premium:</span>
                  <span className="text-lg font-semibold text-off-white">
                    {greenPremium}%
                  </span>
                </div>
              </div>

              <button
                onClick={handlePlaceBid}
                className="w-full mt-6 bg-constructivist-red hover:bg-constructivist-red/90 text-off-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105"
              >
                Place Bid
              </button>
              <div className="mt-2 text-center">
                <Pill variant="green">
                  +{((selectedAuction.baselineCo2 - selectedAuction.co2Intensity) / selectedAuction.baselineCo2 * 100).toFixed(0)}% CO₂ improvement
                </Pill>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bid Confirmation Modal */}
      <Modal
        isOpen={showBidModal}
        onClose={() => setShowBidModal(false)}
        title="Confirm Bid"
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowBidModal(false)}
              className="px-4 py-2 glass text-white/80 hover:text-off-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmBid}
              className="px-4 py-2 bg-constructivist-red hover:bg-constructivist-red/90 text-off-white font-semibold rounded-lg transition-colors"
            >
              Confirm Bid
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="glass p-4 rounded-lg">
            <h4 className="font-semibold text-off-white mb-3">Bid Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white/60">Auction:</span>
                <span className="text-off-white">{selectedAuction?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Quantity:</span>
                <span className="text-off-white">{bidQuantity.toLocaleString()} tons</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Bid Price:</span>
                <span className="text-off-white">${bidPrice.toLocaleString()}/ton</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Total Cost:</span>
                <span className="text-off-white font-bold">${totalCost.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="text-xs text-white/50">
            By placing this bid, you agree to the auction terms and conditions. This bid is binding once the auction closes.
          </div>
        </div>
      </Modal>
    </PageShell>
  )
}

