import { useState, useMemo } from 'react'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Dot } from 'recharts'
import PageShell from '../components/PageShell'
import ChartShell from '../components/ChartShell'
import Table from '../components/Table'
import Tag from '../components/Tag'
import Pill from '../components/Pill'
import { useAuctionData } from '../context/AuctionDataContext'
import { Activity } from '../types'
import { calculateCo2Savings, CHART_COLORS } from '../utils/chartData'

export default function Dashboard() {
  const { latestRun, auctionHistory } = useAuctionData()
  const [activeChartTab, setActiveChartTab] = useState('cost')

  // Generate activities from auction history
  const activities: Activity[] = useMemo(() => {
    return auctionHistory.map((run, idx) => ({
      id: `ACT-${Date.now()}-${idx}`,
      type: 'auction' as const,
      title: `Auction completed: ${run.winner.seller_name} wins`,
      status: 'AUCTION COMPLETED',
      timestamp: new Date().toISOString(),
      metadata: {
        winner: run.winner.seller_name,
        netPrice: run.winner.net_price_per_ton,
        totalCost: run.winner.net_total,
      },
    }))
  }, [auctionHistory])

  const activityColumns = [
    { key: 'title', header: 'Activity' },
    {
      key: 'status',
      header: 'Status',
      render: (row: Activity) => {
        const variantMap: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
          'AUCTION COMPLETED': 'success',
          'LIVE AUCTION': 'error',
          'ORDER SETTLED': 'success',
          'LOAN PENDING': 'warning',
        }
        return <Tag variant={variantMap[row.status] || 'default'}>{row.status}</Tag>
      },
    },
    {
      key: 'timestamp',
      header: 'Date',
      render: (row: Activity) => new Date(row.timestamp).toLocaleDateString(),
    },
  ]

  // Prepare chart data from auction history
  const chartData = useMemo(() => {
    if (auctionHistory.length === 0) return []
    
    let cumulativeCo2Saved = 0
    let cumulativeCost = 0
    
    return auctionHistory.map((run, idx) => {
      const co2Savings = calculateCo2Savings(run.winner.quantity_tons, run.winner.is_eaf)
      cumulativeCo2Saved += co2Savings
      cumulativeCost += run.winner.net_total
      
      return {
        index: idx + 1,
        label: `Run ${idx + 1}`,
        cost: run.winner.net_price_per_ton,
        co2Savings: co2Savings,
        cumulativeCo2: cumulativeCo2Saved,
        isLatest: idx === 0,
      }
    }).reverse() // Show oldest to newest
  }, [auctionHistory])

  return (
    <PageShell>
      {/* Middle Section - Portfolio chart spans 7-8 cols, Latest Auction spans 4-5 cols */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Portfolio Chart */}
        <div className="col-span-12 lg:col-span-8">
          <ChartShell
            title="Portfolio Cost vs Carbon"
            subtitle="Green vs conventional steel comparison over time"
            tabs={[
              { label: 'Cost', value: 'cost' },
              { label: 'CO₂', value: 'co2' },
            ]}
            activeTab={activeChartTab}
            onTabChange={setActiveChartTab}
          >
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-full min-h-[300px] text-secondary-text">
                <div className="text-center">
                  <div className="text-3xl mb-3">📊</div>
                  <div className="text-sm font-medium mb-1">No data yet</div>
                  <div className="text-xs text-secondary-text">Run auctions to see portfolio trends</div>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                  <XAxis 
                    dataKey="label" 
                    stroke={CHART_COLORS.secondary}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke={CHART_COLORS.secondary}
                    style={{ fontSize: '12px' }}
                    label={activeChartTab === 'cost' 
                      ? { value: 'Price ($/ton)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.secondary } }
                      : { value: 'CO₂ Saved (kg)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.secondary } }
                    }
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                      border: `1px solid ${CHART_COLORS.grid}`,
                      borderRadius: '8px',
                      color: CHART_COLORS.primary
                    }}
                    formatter={(value: number, name: string) => {
                      if (name === 'cost') return [`$${value.toFixed(2)}/ton`, 'Price']
                      if (name === 'co2Savings') return [`${value.toFixed(0)} kg`, 'CO₂ Saved']
                      return [value, name]
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="line"
                  />
                  {activeChartTab === 'cost' && (
                    <Line 
                      type="monotone" 
                      dataKey="cost" 
                      stroke={CHART_COLORS.cost} 
                      strokeWidth={2}
                      name="Price per Ton"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props
                        if (payload.isLatest) {
                          return <Dot cx={cx} cy={cy} r={5} fill={CHART_COLORS.cost} stroke={CHART_COLORS.primary} strokeWidth={2} />
                        }
                        return <Dot cx={cx} cy={cy} r={3} fill={CHART_COLORS.cost} />
                      }}
                    />
                  )}
                  {activeChartTab === 'co2' && (
                    <Line 
                      type="monotone" 
                      dataKey="co2Savings" 
                      stroke={CHART_COLORS.co2} 
                      strokeWidth={2}
                      name="CO₂ Saved"
                      dot={(props: any) => {
                        const { cx, cy, payload } = props
                        if (payload.isLatest) {
                          return <Dot cx={cx} cy={cy} r={5} fill={CHART_COLORS.co2} stroke={CHART_COLORS.primary} strokeWidth={2} />
                        }
                        return <Dot cx={cx} cy={cy} r={3} fill={CHART_COLORS.co2} />
                      }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartShell>
        </div>

        {/* Latest Auction Run */}
        <div className="col-span-12 lg:col-span-4">
          <div className="glass p-6">
            <h3 className="section-title mb-4">Latest Auction Run</h3>
            {latestRun ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg font-bold text-off-white">
                      {latestRun.winner.seller_name}
                    </span>
                    {latestRun.winner.is_eaf && <Pill variant="green">EAF</Pill>}
                  </div>
                  <div className="text-sm text-white/60 space-y-1">
                    <div>Net Price: ${latestRun.winner.net_price_per_ton.toFixed(2)}/ton</div>
                    <div>Total: ${latestRun.winner.net_total.toLocaleString()}</div>
                    <div>Transport: {latestRun.winner.transport_mode}</div>
                    <div>Distance: {latestRun.winner.distance_km.toFixed(0)} km</div>
                  </div>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="text-xs text-white/60 mb-1">Quantity</div>
                  <div className="text-lg font-semibold text-off-white">
                    {latestRun.winner.quantity_tons.toLocaleString()} tons
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-white/40 py-8">
                <div className="text-sm">No auction runs yet</div>
                <div className="text-xs mt-2">Run an auction to see results here</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="section-title mb-4">Recent Activity</h2>
        {activities.length > 0 ? (
          <Table
            columns={activityColumns}
            data={activities.slice(0, 10)}
          />
        ) : (
          <div className="glass p-12 text-center text-white/40">
            <div className="text-sm">No activity yet</div>
            <div className="text-xs mt-2">Run auctions to see activity here</div>
          </div>
        )}
      </div>
    </PageShell>
  )
}
