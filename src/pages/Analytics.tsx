import { useMemo } from 'react'
import { ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'
import PageShell from '../components/PageShell'
import ChartShell from '../components/ChartShell'
import { useAuctionData } from '../context/AuctionDataContext'
import { calculateCo2Savings, calculateGreenPremium, CHART_COLORS } from '../utils/chartData'

export default function Analytics() {
  const { auctionHistory } = useAuctionData()

  // Calculate CO2 reduced over time
  const co2Reduced = useMemo(() => {
    if (auctionHistory.length === 0) return []
    
    let cumulative = 0
    return auctionHistory.map((run, idx) => {
      const savings = calculateCo2Savings(run.winner.quantity_tons, run.winner.is_eaf)
      cumulative += savings
      return {
        date: `Run ${idx + 1}`,
        value: cumulative,
      }
    })
  }, [auctionHistory])

  // Calculate green premium over time
  const greenPremium = useMemo(() => {
    if (auctionHistory.length === 0) return []
    
    return auctionHistory
      .filter((run) => run.winner.is_eaf)
      .map((run, idx) => ({
        date: `Green ${idx + 1}`,
        value: calculateGreenPremium(run.winner.net_price_per_ton, run.winner.is_eaf),
      }))
  }, [auctionHistory])

  // Regional breakdown
  const regionalBreakdown = useMemo(() => {
    const regions: Record<string, { volume: number; co2Intensity: number; count: number }> = {}
    
    auctionHistory.forEach((run) => {
      // Determine region based on seller location
      let region = 'US'
      const sellerName = run.winner.seller_name.toLowerCase()
      if (sellerName.includes('europe') || sellerName.includes('luxembourg') || sellerName.includes('germany') || sellerName.includes('thyssen')) {
        region = 'EU'
      } else if (sellerName.includes('india') || sellerName.includes('tata') || sellerName.includes('jsw')) {
        region = 'India'
      } else if (sellerName.includes('china') || sellerName.includes('japan') || sellerName.includes('korea') || sellerName.includes('taiwan') || sellerName.includes('baosteel') || sellerName.includes('nippon') || sellerName.includes('posco')) {
        region = 'Asia'
      }
      
      if (!regions[region]) {
        regions[region] = { volume: 0, co2Intensity: 0, count: 0 }
      }
      
      regions[region].volume += run.winner.quantity_tons
      // CO2 intensity: EAF = 0.6, conventional = 1.9
      const intensity = run.winner.is_eaf ? 0.6 : 1.9
      regions[region].co2Intensity = (regions[region].co2Intensity * regions[region].count + intensity) / (regions[region].count + 1)
      regions[region].count += 1
    })
    
    return Object.entries(regions).map(([region, data]) => ({
      region,
      volume: data.volume,
      co2Intensity: data.co2Intensity,
    }))
  }, [auctionHistory])

  const totalCo2Saved = co2Reduced.length > 0 ? co2Reduced[co2Reduced.length - 1].value : 0
  const avgGreenPremium = greenPremium.length > 0
    ? greenPremium.reduce((sum, d) => sum + d.value, 0) / greenPremium.length
    : 0

  if (auctionHistory.length === 0) {
    return (
      <PageShell>
        <div className="glass p-12 text-center text-white/40">
          <div className="text-sm">No analytics data available</div>
          <div className="text-xs mt-2">Run auctions to see analytics here</div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CO₂ Reduced vs Baseline */}
        <ChartShell
          title="CO₂ Reduced vs Baseline"
          subtitle="Cumulative CO₂ savings over time"
        >
          {co2Reduced.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-white/40">
              <div className="text-center">
                <div className="text-sm">No CO₂ savings data available</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={co2Reduced} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis 
                  dataKey="date" 
                  stroke={CHART_COLORS.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={CHART_COLORS.secondary}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'CO₂ Saved (kg)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.secondary } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '8px',
                    color: CHART_COLORS.primary
                  }}
                  formatter={(value: number) => [`${value.toFixed(0)} kg`, 'Cumulative CO₂ Saved']}
                />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke={CHART_COLORS.co2} 
                  fill={CHART_COLORS.co2}
                  name="Cumulative CO₂ Saved"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
          {co2Reduced.length > 0 && (
            <div className="mt-4 text-center text-sm text-white/60">
              Total: {totalCo2Saved.toFixed(0)} kg CO₂ • {co2Reduced.length} auction{co2Reduced.length !== 1 ? 's' : ''} analyzed
            </div>
          )}
        </ChartShell>

        {/* Green Premium Paid */}
        <ChartShell
          title="Green Premium Paid vs Market Index"
          subtitle="Premium percentage over conventional steel"
        >
          {greenPremium.length === 0 ? (
            <div className="flex items-center justify-center h-full min-h-[300px] text-white/40">
              <div className="text-center">
                <div className="text-sm">No green premium data available</div>
                <div className="text-xs mt-2">Run green (EAF) auctions to see premium trends</div>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={greenPremium} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis 
                  dataKey="date" 
                  stroke={CHART_COLORS.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke={CHART_COLORS.secondary}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Premium (%)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.secondary } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '8px',
                    color: CHART_COLORS.primary
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Green Premium']}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={CHART_COLORS.blended} 
                  strokeWidth={2}
                  name="Green Premium"
                  dot={{ fill: CHART_COLORS.blended, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
          {greenPremium.length > 0 && (
            <div className="mt-4 text-center text-sm text-white/60">
              Average: {avgGreenPremium.toFixed(1)}% • {greenPremium.length} green auction{greenPremium.length !== 1 ? 's' : ''}
            </div>
          )}
        </ChartShell>
      </div>

      {/* Regional Breakdown */}
      <div className="mb-6">
        <ChartShell
          title="Regional Breakdown"
          subtitle="Purchases and carbon intensity by region"
        >
          {regionalBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={regionalBreakdown} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
                <XAxis 
                  dataKey="region" 
                  stroke={CHART_COLORS.secondary}
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  yAxisId="left"
                  stroke={CHART_COLORS.secondary}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'Volume (tons)', angle: -90, position: 'insideLeft', style: { fill: CHART_COLORS.secondary } }}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke={CHART_COLORS.co2}
                  style={{ fontSize: '12px' }}
                  label={{ value: 'CO₂ Intensity (kg/ton)', angle: 90, position: 'insideRight', style: { fill: CHART_COLORS.co2 } }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                    border: `1px solid ${CHART_COLORS.grid}`,
                    borderRadius: '8px',
                    color: CHART_COLORS.primary
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === 'volume') return [`${value.toLocaleString()} tons`, 'Volume']
                    if (name === 'co2Intensity') return [`${value.toFixed(2)} kg/ton`, 'CO₂ Intensity']
                    return [value, name]
                  }}
                />
                <Legend />
                <Bar 
                  yAxisId="left"
                  dataKey="volume" 
                  fill={CHART_COLORS.blended}
                  name="Volume (tons)"
                />
                <Bar 
                  yAxisId="right"
                  dataKey="co2Intensity" 
                  fill={CHART_COLORS.co2}
                  name="CO₂ Intensity (kg/ton)"
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-white/40 py-8">
              No regional data available
            </div>
          )}
        </ChartShell>
      </div>

      {/* Export Actions */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={() => {
            // Simple CSV export
            const csv = [
              ['Date', 'CO2 Saved (kg)', 'Green Premium (%)'].join(','),
              ...co2Reduced.map((d, i) => [
                d.date,
                d.value.toFixed(0),
                greenPremium[i]?.value.toFixed(1) || 'N/A',
              ].join(',')),
            ].join('\n')
            
            const blob = new Blob([csv], { type: 'text/csv' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics-${new Date().toISOString().slice(0, 10)}.csv`
            a.click()
            URL.revokeObjectURL(url)
          }}
          className="glass px-6 py-3 rounded-lg text-off-white hover:bg-white/10 transition-colors font-medium"
        >
          Export CSV
        </button>
        <button className="glass px-6 py-3 rounded-lg text-off-white hover:bg-white/10 transition-colors font-medium">
          Export PDF
        </button>
      </div>
    </PageShell>
  )
}
