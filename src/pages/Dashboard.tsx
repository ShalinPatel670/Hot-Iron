import { useState } from 'react'
import PageShell from '../components/PageShell'
import StatCard from '../components/StatCard'
import ChartShell from '../components/ChartShell'
import AuctionCard from '../components/AuctionCard'
import Table from '../components/Table'
import Tag from '../components/Tag'
import { mockAuctions, mockActivities, mockOrders } from '../data/mockData'
import { Activity } from '../types'

export default function Dashboard() {
  const [activeChartTab, setActiveChartTab] = useState('cost')

  // Calculate stats from mock data
  const blendedCost = 865
  const co2Intensity = 0.7
  const baselineCo2 = 1.9
  const co2VsBaseline = ((baselineCo2 - co2Intensity) / baselineCo2) * 100
  const totalGreenVolume = mockOrders.reduce((sum, order) => sum + (order.volume * order.greenShare / 100), 0)
  const activeAuctionsCount = mockAuctions.length

  const activityColumns = [
    { key: 'title', header: 'Activity' },
    {
      key: 'status',
      header: 'Status',
      render: (row: Activity) => {
        const variantMap: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
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

  return (
    <PageShell>
      {/* Stats Grid - 12 column grid, 4 cards each spanning 3 columns */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard
            label="BLENDED STEEL COST"
            value={blendedCost}
            unit="$/ton"
            trend="up"
            trendValue="+2.3% vs last month"
            accent="neutral"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard
            label="CO₂ INTENSITY VS BASELINE"
            value={co2Intensity.toFixed(1)}
            unit="kg CO₂/ton"
            trend="down"
            trendValue={`${co2VsBaseline.toFixed(0)}% better`}
            accent="green"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard
            label="TOTAL GREEN VOLUME SECURED"
            value={(totalGreenVolume / 1000).toFixed(0)}
            unit="k tons"
            trend="up"
            trendValue="+15% this quarter"
            accent="green"
          />
        </div>
        <div className="col-span-12 md:col-span-6 lg:col-span-3">
          <StatCard
            label="ACTIVE AUCTIONS"
            value={activeAuctionsCount}
            trend="neutral"
            accent="red"
          />
        </div>
      </div>

      {/* Middle Section - Portfolio chart spans 7-8 cols, Auction Exposure spans 4-5 cols */}
      <div className="grid grid-cols-12 gap-6 mb-8">
        {/* Portfolio Chart */}
        <div className="col-span-12 lg:col-span-8">
          <ChartShell
            title="Portfolio Cost vs Carbon"
            subtitle="Green vs conventional steel comparison over time"
            tabs={[
              { label: 'Cost', value: 'cost' },
              { label: 'CO₂', value: 'co2' },
              { label: 'Blended', value: 'blended' },
            ]}
            activeTab={activeChartTab}
            onTabChange={setActiveChartTab}
          >
            <div className="flex items-center justify-center h-full min-h-[300px] text-secondary-text">
              <div className="text-center">
                <div className="text-3xl mb-3">📊</div>
                <div className="text-sm font-medium mb-1">Chart visualization placeholder</div>
                <div className="text-xs text-secondary-text">Cost (red) and CO₂ improvement (green) trends over time</div>
                <div className="flex items-center justify-center gap-4 mt-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-constructivist-red"></div>
                    <span className="text-secondary-text">Cost</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-carbon-green"></div>
                    <span className="text-secondary-text">CO₂ Improvement</span>
                  </div>
                </div>
              </div>
            </div>
          </ChartShell>
        </div>

        {/* Current Auction Exposure */}
        <div className="col-span-12 lg:col-span-4">
          <div className="glass p-6">
            <h3 className="section-title mb-4">Current Auction Exposure</h3>
            <div className="space-y-3">
              {mockAuctions.slice(0, 3).map((auction) => (
                <AuctionCard
                  key={auction.id}
                  {...auction}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h2 className="section-title mb-4">Recent Activity</h2>
        <Table
          columns={activityColumns}
          data={mockActivities}
        />
      </div>
    </PageShell>
  )
}

