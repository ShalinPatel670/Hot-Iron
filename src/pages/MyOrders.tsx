import { useState } from 'react'
import PageShell from '../components/PageShell'
import Table from '../components/Table'
import Drawer from '../components/Drawer'
import Tag from '../components/Tag'
import ChartShell from '../components/ChartShell'
import { mockOrders } from '../data/mockData'
import { Order } from '../types'

export default function MyOrders() {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [filters, setFilters] = useState({
    status: 'all',
    region: 'all',
    product: 'all',
    counterparty: '',
  })

  const filteredOrders = mockOrders.filter((order) => {
    if (filters.status !== 'all' && order.status !== filters.status) return false
    if (filters.region !== 'all' && order.region !== filters.region) return false
    if (filters.product !== 'all' && order.product !== filters.product) return false
    if (filters.counterparty && !order.counterparty.toLowerCase().includes(filters.counterparty.toLowerCase())) return false
    return true
  })

  const statusVariantMap: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
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
              <option value="all">All</option>
              <option value="Pending">Pending</option>
              <option value="Settled">Settled</option>
              <option value="In transit">In transit</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Region</label>
            <select
              value={filters.region}
              onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="all">All</option>
              <option value="US">US</option>
              <option value="EU">EU</option>
              <option value="India">India</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-white/60 mb-2">Product</label>
            <select
              value={filters.product}
              onChange={(e) => setFilters({ ...filters, product: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-off-white focus:outline-none focus:ring-2 focus:ring-constructivist-red"
            >
              <option value="all">All</option>
              <option value="Hot Rolled Coil (HRC)">Hot Rolled Coil (HRC)</option>
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
      <Table
        columns={columns}
        data={filteredOrders}
        onRowClick={setSelectedOrder}
      />

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
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-carbon-green"></div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-off-white">Matched</div>
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
              <div className="flex items-center justify-center h-full min-h-[200px] text-white/40">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Chart placeholder</div>
                  <div className="text-sm mt-2">
                    CO₂ saved: {((selectedOrder.co2VsBaseline / 100) * selectedOrder.volume * 1.9).toFixed(0)} kg
                  </div>
                </div>
              </div>
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

