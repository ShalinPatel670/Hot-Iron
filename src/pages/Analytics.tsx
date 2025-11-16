import PageShell from '../components/PageShell'
import ChartShell from '../components/ChartShell'
import { mockAnalytics } from '../data/mockData'

export default function Analytics() {
  return (
    <PageShell>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* CO₂ Reduced vs Baseline */}
        <ChartShell
          title="CO₂ Reduced vs Baseline"
          subtitle="Cumulative CO₂ savings over time"
        >
          <div className="flex items-center justify-center h-full min-h-[300px] text-white/40">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>Chart placeholder</div>
              <div className="text-sm mt-2">
                Total: {mockAnalytics.co2Reduced.reduce((sum, d) => sum + d.value, 0).toLocaleString()} kg CO₂
              </div>
            </div>
          </div>
        </ChartShell>

        {/* Green Premium Paid */}
        <ChartShell
          title="Green Premium Paid vs Market Index"
          subtitle="Premium percentage over conventional steel"
        >
          <div className="flex items-center justify-center h-full min-h-[300px] text-white/40">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <div>Chart placeholder</div>
              <div className="text-sm mt-2">
                Average: {(mockAnalytics.greenPremium.reduce((sum, d) => sum + d.value, 0) / mockAnalytics.greenPremium.length).toFixed(1)}%
              </div>
            </div>
          </div>
        </ChartShell>
      </div>

      {/* Regional Breakdown */}
      <div className="mb-6">
        <ChartShell
          title="Regional Breakdown"
          subtitle="Purchases and carbon intensity by region"
        >
          <div className="space-y-4">
            {mockAnalytics.regionalBreakdown.map((region) => (
              <div key={region.region} className="glass p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-semibold text-off-white">{region.region}</div>
                    <div className="text-sm text-white/60">
                      {region.volume.toLocaleString()} tons
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-carbon-green">
                      {region.co2Intensity.toFixed(2)} kg CO₂/ton
                    </div>
                    <div className="text-xs text-white/60">Intensity</div>
                  </div>
                </div>
                {region.volume > 0 && (
                  <div className="w-full bg-white/5 rounded-full h-2 mt-2">
                    <div
                      className="bg-carbon-green h-2 rounded-full"
                      style={{
                        width: `${(region.volume / mockAnalytics.regionalBreakdown.reduce((sum, r) => sum + r.volume, 0)) * 100}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </ChartShell>
      </div>

      {/* Export Actions */}
      <div className="flex gap-4 justify-end">
        <button className="glass px-6 py-3 rounded-lg text-off-white hover:bg-white/10 transition-colors font-medium">
          Export CSV
        </button>
        <button className="glass px-6 py-3 rounded-lg text-off-white hover:bg-white/10 transition-colors font-medium">
          Export PDF
        </button>
      </div>
    </PageShell>
  )
}

