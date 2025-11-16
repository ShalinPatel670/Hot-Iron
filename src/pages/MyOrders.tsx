import { useState, useMemo } from 'react'
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts'
import PageShell from '../components/PageShell'
import Table from '../components/Table'
import Drawer from '../components/Drawer'
import Tag from '../components/Tag'
import ChartShell from '../components/ChartShell'
import { useAuctionData } from '../context/AuctionDataContext'
import { Order } from '../types'
import { CHART_COLORS, BASELINE_PRICE_PER_TON, BASELINE_CO2_PER_TON } from '../utils/chartData'

const STORAGE_KEY_ORDERS = 'hot-iron-orders'

function loadOrders(): Order[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_ORDERS)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

function saveOrders(orders: Order[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders))
  } catch (error) {
    console.error('Failed to save orders:', error)
  }
}

export default function MyOrders() {
  const { auctionHistory } = useAuctionData()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orders, setOrders] = useState<Order[]>(loadOrders)
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all',
    product: 'all',
    counterparty: '',
  })

  // Convert auction runs to orders and merge with existing orders
  const allOrders = useMemo(() => {
    const auctionOrders: Order[] = auctionHistory.map((run, idx) => {
      // Determine region based on seller location (rough approximation)
      let region = 'US'
      const sellerName = run.winner.seller_name.toLowerCase()
      if (sellerName.includes('europe') || sellerName.includes('luxembourg') || sellerName.includes('germany')) {
        region = 'EU'
      } else if (sellerName.includes('india') || sellerName.includes('tata') || sellerName.includes('jsw')) {
        region = 'India'
      } else if (sellerName.includes('china') || sellerName.includes('japan') || sellerName.includes('korea') || sellerName.includes('taiwan')) {
        region = 'Asia'
      }

      return {
        id: `ORD-${Date.now()}-${idx}`,
        product: 'Hot Rolled Coil (HRC)',
        region,
        volume: run.winner.quantity_tons,
        price: run.winner.net_price_per_ton,
        co2VsBaseline: run.winner.is_eaf ? -68 : -10, // EAF saves ~68% vs baseline
        greenShare: run.winner.is_eaf ? 100 : 0,
        status: 'Settled' as const,
        counterparty: run.winner.seller_name,
        createdAt: new Date().toISOString(),
        settledAt: new Date().toISOString(),
      }
    })

    // Merge with existing orders, avoiding duplicates
    const existingIds = new Set(orders.map((o) => o.id))
    const newOrders = auctionOrders.filter((o) => !existingIds.has(o.id))
    
    if (newOrders.length > 0) {
      const merged = [...newOrders, ...orders]
      setOrders(merged)
      saveOrders(merged)
      return merged
    }

    return orders
  }, [auctionHistory, orders])

  // Prepare scatter chart data comparing orders
  const scatterChartData = useMemo(() => {
    if (!selectedOrder) return []
    
    // Calculate CO2 savings per ton for the selected order
    const selectedCo2SavingsPerTon = (selectedOrder.co2VsBaseline / 100) * BASELINE_CO2_PER_TON
    
    // Baseline point (conventional steel)
    const baselinePoint = {
      x: BASELINE_PRICE_PER_TON,
      y: 0, // No CO2 savings
      name: 'Baseline (Conventional)',
      isSelected: false,
      isBaseline: true,
    }
    
    // Selected order point
    const selectedPoint = {
      x: selectedOrder.price,
      y: selectedCo2SavingsPerTon,
      name: selectedOrder.counterparty,
      isSelected: true,
      isBaseline: false,
    }
    
    // Add other orders for context (if any green orders exist)
    const otherPoints = allOrders
      .filter(order => order.id !== selectedOrder.id && order.greenShare > 0)
      .slice(0, 5) // Limit to 5 other points for clarity
      .map(order => ({
        x: order.price,
        y: (order.co2VsBaseline / 100) * BASELINE_CO2_PER_TON,
        name: order.counterparty,
        isSelected: false,
        isBaseline: false,
      }))
    
    return [baselinePoint, selectedPoint, ...otherPoints]
  }, [selectedOrder, allOrders])

  const filteredOrders = allOrders.filter((order) => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.region !== 'all' && order.region !== filters.region) return false
    if (filters.product !== 'all' && order.product !== filters.product) return false
    if (filters.counterparty && !order.counterparty.toLowerCase().includes(filters.counterparty.toLowerCase())) return false
    return true
  })

  const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
    'Settled': 'success',
    'Pending': 'warning',
    'In transit': 'info',
    'Cancelled': 'error',
  }

  const columns = [
    { key: 'id', header: 'Order ID' },
    { key: 'product', header: 'Product' },
    { key: 'region', header: 'Region' },
    {
      key: 'volume',
      header: 'Volume',
      render: (row: Order) => `${row.volume.toLocaleString()} tons`,
    },
    {
      key: 'price',
      header: 'Price',
      render: (row: Order) => `$${row.price.toLocaleString()}/ton`,
    },
    {
      key: 'co2VsBaseline',
      header: 'CO₂ vs Baseline',
      render: (row: Order) => (
        <span className="text-carbon-green font-semibold">
          {row.co2VsBaseline > 0 ? '+' : ''}{row.co2VsBaseline}%
        </span>
      ),
    },
    {
      key: 'greenShare',
      header: 'Green Share',
      render: (row: Order) => `${row.greenShare}%`,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row: Order) => (
        <Tag variant={statusVariantMap[row.status] || 'default'}>
          {row.status}
        </Tag>
      ),
    },
  ]

  return (
    <PageShell>
      {/* Filters */}
      <div className="glass p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm text-white/60 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="all" style={{ color: 'black' }}>All</option>
              <option value="Pending" style={{ color: 'black' }}>Pending</option>
              <option value="Settled" style={{ color: 'black' }}>Settled</option>
              <option value="In transit" style={{ color: 'black' }}>In transit</option>
              <option value="Cancelled" style={{ color: 'black' }}>Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Region</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="all" style={{ color: 'black' }}>All</option>
              <option value="US" style={{ color: 'black' }}>US</option>
              <option value="EU" style={{ color: 'black' }}>EU</option>
              <option value="India" style={{ color: 'black' }}>India</option>
              <option value="Asia" style={{ color: 'black' }}>Asia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Product</label>
            <select
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="all" style={{ color: 'black' }}>All</option>
              <option value="Hot Rolled Coil (HRC)" style={{ color: 'black' }}>Hot Rolled Coil (HRC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Counterparty</label>
            <input
              type="text"
              value={filters.counterparty}
              onChange={(e) => setFilters({ ...filters, counterparty: e.target.value })}
              placeholder="Search..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      {filteredOrders.length > 0 ? (
        <Table
          columns={columns}
          data={filteredOrders}
          onRowClick={setSelectedOrder}
        />
      ) : (
        <div className="glass p-12 text-center text-white/40">
          <div className="text-sm">No orders yet</div>
          <div className="text-xs mt-2">Orders will appear here after running auctions</div>
        </div>
      )}

      {/* Order Detail Drawer */}
      {selectedOrder && (
        <Drawer
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order ${selectedOrder.id}`}
        >
          <div className="space-y-6">
            {/* Order Timeline */}
            <div>
              <h3 className="text-lg font-bold text-off-white mb-4">Order Timeline</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-carbon-green"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-off-white">Created</div>
                    <div className="text-xs text-white/60">{new Date(selectedOrder.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                {selectedOrder.status === 'Settled' && selectedOrder.settledAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-carbon-green"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-off-white">Settled</div>
                      <div className="text-xs text-white/60">{new Date(selectedOrder.settledAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                )}
                {selectedOrder.status === 'In transit' && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-off-white">In Transit</div>
                      <div className="text-xs text-white/60">Expected delivery: TBD</div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Order Breakdown */}
            <div>
              <h3 className="text-lg font-bold text-off-white mb-4">Order Breakdown</h3>
              <div className="glass p-4 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/60">Total Volume:</span>
                  <span className="text-off-white font-semibold">{selectedOrder.volume.toLocaleString()} tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Green Share:</span>
                  <span className="text-carbon-green font-semibold">{selectedOrder.greenShare}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Conventional Share:</span>
                  <span className="text-off-white font-semibold">{100 - selectedOrder.greenShare}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60">Price per ton:</span>
                  <span className="text-off-white font-semibold">${selectedOrder.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-white/10">
                  <span className="text-white/60">Total Cost:</span>
                  <span className="text-xl font-bold text-off-white">
                    ${(selectedOrder.volume * selectedOrder.price).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Cost vs CO₂ Tradeoff */}
            <ChartShell
              title="Cost vs CO₂ Tradeoff"
              subtitle="Visualization of this order's environmental impact"
            >
              {scatterChartData.length === 0 ? (
                <div className="flex items-center justify-center h-full min-h-[200px] text-white/40">
                  <div className="text-center">
                    <div className="text-sm">Select an order to view cost vs CO₂ tradeoff</div>
                  </div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <ScatterChart data={scatterChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                    <XAxis 
                      type="number"
                      dataKey="x"
                      name="Price"
                      unit=" $/ton"
                      stroke={CHART_COLORS.secondary}
                      style={{ fontSize: '12px' }}
                      label={{ value: 'Price ($/ton)', position: 'insideBottom', offset: -5, style: { fill: CHART_COLORS.secondary } }}
                    />
                    <YAxis 
                      type="number"
                      dataKey="y"
                      name="CO₂ Savings"
                      unit=" kg/ton"
                      stroke={CHART_COLORS.secondary}
                      style={{ fontSize: '12px' }}
                      label={{ value: 'CO₂ Savings (kg/ton)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.secondary } }}
                    />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      contentStyle={{ 
                        backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                        border: `1px solid ${CHART_COLORS.grid}`,
                        borderRadius: '8px',
                        color: CHART_COLORS.primary
                      }}
                      formatter={(value: number, name: string) => {
                        if (name === 'x') return [`$${value.toFixed(2)}/ton`, 'Price']
                        if (name === 'y') return [`${value.toFixed(2)} kg/ton`, 'CO₂ Savings']
                        return [value, name]
                      }}
                      labelFormatter={(label) => {
                        const point = scatterChartData.find((p: any) => p.x === label)
                        return point ? point.name : label
                      }}
                    />
                    <Legend />
                    <Scatter 
                      name="Orders" 
                      data={scatterChartData.filter((p: any) => !p.isBaseline && !p.isSelected)} 
                      fill={CHART_COLORS.secondary}
                    >
                      {scatterChartData
                        .filter((p: any) => !p.isBaseline && !p.isSelected)
                        .map((_entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={CHART_COLORS.secondary} />
                        ))}
                    </Scatter>
                    <Scatter 
                      name="Baseline" 
                      data={scatterChartData.filter((p: any) => p.isBaseline)} 
                      fill={CHART_COLORS.cost}
                    >
                      {scatterChartData
                        .filter((p: any) => p.isBaseline)
                        .map((_entry: any, index: number) => (
                          <Cell key={`cell-baseline-${index}`} fill={CHART_COLORS.cost} />
                        ))}
                    </Scatter>
                    <Scatter 
                      name="Selected Order" 
                      data={scatterChartData.filter((p: any) => p.isSelected)} 
                      fill={CHART_COLORS.co2}
                    >
                      {scatterChartData
                        .filter((p: any) => p.isSelected)
                        .map((_entry: any, index: number) => (
                          <Cell key={`cell-selected-${index}`} fill={CHART_COLORS.co2} />
                        ))}
                    </Scatter>
                  </ScatterChart>
                </ResponsiveContainer>
              )}
              {selectedOrder && (
                <div className="mt-4 text-center text-sm text-white/60">
                  CO₂ saved: {((selectedOrder.co2VsBaseline / 100) * selectedOrder.volume * BASELINE_CO2_PER_TON).toFixed(0)} kg
                  {selectedOrder.greenShare > 0 && (
                    <span className="ml-2 text-carbon-green">• {selectedOrder.greenShare}% Green Share</span>
                  )}
                </div>
              )}
            </ChartShell>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button className="w-full glass p-3 rounded-lg text-off-white hover:bg-white/10 transition-colors text-left">
                View related loan
              </button>
              <button className="w-full glass p-3 rounded-lg text-off-white hover:bg-white/10 transition-colors text-left">
                Download documentation
              </button>
            </div>
          </div>
        </Drawer>
      )}
    </PageShell>
  )
}
