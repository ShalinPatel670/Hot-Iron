import { useState } from 'react'
import PageShell from '../components/PageShell'
import Tag from '../components/Tag'
import ChartShell from '../components/ChartShell'
import { mockLoans } from '../data/mockData'
import { Loan } from '../types'

export default function Loans() {
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(mockLoans[0] || null)

  return (
    <PageShell>
      <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6">
        {/* Loan List */}
        <div className="space-y-4">
          {mockLoans.map((loan) => (
            <div
              key={loan.id}
              onClick={() => setSelectedLoan(loan)}
              className={`glass p-6 cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-lg ${
                selectedLoan?.id === loan.id ? 'ring-2 ring-constructivist-red' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-off-white mb-1">{loan.lenderName}</h3>
                  <div className="flex items-center gap-2">
                    <Tag variant="info">{loan.lenderRating}</Tag>
                    <span className="text-sm text-white/60">Effective Rate: {loan.effectiveRate}% APR</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <div className="text-xs text-white/60 mb-1">Tenor</div>
                  <div className="text-lg font-semibold text-off-white">{loan.tenor}</div>
                </div>
                <div>
                  <div className="text-xs text-white/60 mb-1">Maximum Amount</div>
                  <div className="text-lg font-semibold text-off-white">
                    ${(loan.maxAmount / 1000000).toFixed(0)}M
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/60">Linked to:</span>
                  <Tag variant="default">
                    {loan.linkedTo.type === 'order' ? 'Order' : 'Auction'}: {loan.linkedTo.name}
                  </Tag>
                </div>
                <div className="text-sm text-carbon-green font-medium">
                  {loan.co2Note}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Loan Detail Panel */}
        {selectedLoan && (
          <div className="glass p-6 sticky top-6 h-fit">
            <h2 className="text-2xl font-bold text-off-white mb-6">{selectedLoan.lenderName}</h2>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between">
                <span className="text-white/60">Lender Rating:</span>
                <Tag variant="info">{selectedLoan.lenderRating}</Tag>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Effective Rate:</span>
                <span className="text-off-white font-semibold">{selectedLoan.effectiveRate}% APR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Tenor:</span>
                <span className="text-off-white font-semibold">{selectedLoan.tenor}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60">Maximum Amount:</span>
                <span className="text-off-white font-semibold">
                  ${selectedLoan.maxAmount.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="glass-strong p-4 rounded-lg mb-6">
              <div className="text-sm text-white/60 mb-2">Net Cost Impact</div>
              <div className="text-2xl font-bold text-off-white">
                {selectedLoan.netCostImpact > 0 ? '+' : ''}{selectedLoan.netCostImpact}%
              </div>
              <div className="text-xs text-white/50 mt-1">vs not financing</div>
            </div>

            <div className="mb-6">
              <div className="text-sm text-white/60 mb-2">CO₂ Impact</div>
              <div className="text-carbon-green font-semibold">{selectedLoan.co2Note}</div>
            </div>

            <ChartShell
              title="Cost Breakdown"
              subtitle="Repayment schedule over time"
            >
              <div className="flex items-center justify-center h-full min-h-[200px] text-white/40">
                <div className="text-center">
                  <div className="text-4xl mb-2">📊</div>
                  <div>Repayment schedule chart</div>
                </div>
              </div>
            </ChartShell>

            <div className="mt-6 p-4 glass-strong rounded-lg mb-4">
              <p className="text-sm text-white/70">
                This loan allows you to secure 10,000 tons of low-carbon HRC at a blended premium of{' '}
                {selectedLoan.netCostImpact}% over grey steel.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <button className="w-full glass p-3 rounded-lg text-off-white hover:bg-white/10 transition-colors">
                Request Term Sheet
              </button>
              <button className="w-full bg-constructivist-red hover:bg-constructivist-red/90 text-off-white font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-105">
                Accept Offer
              </button>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  )
}

