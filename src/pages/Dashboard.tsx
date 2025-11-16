import { useState } from 'react'
import PageShell from '../components/PageShell'
import ChartShell from '../components/ChartShell'
import AuctionCard from '../components/AuctionCard'
import Table from '../components/Table'
import Tag from '../components/Tag'
import { mockAuctions, mockActivities } from '../data/mockData'
import { Activity } from '../types'

export default function Dashboard() {
  const [activeChartTab, setActiveChartTab] = useState('cost')

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

